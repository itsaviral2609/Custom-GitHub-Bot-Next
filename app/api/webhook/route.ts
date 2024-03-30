import yaml from 'js-yaml'
import { Octokit } from '@octokit/rest'
import { NextResponse } from 'next/server'

const octokit = new Octokit({
  auth: process.env.KDB_BOT_GITHUB_TOKEN,
})

type RoleConfig = {
  maxAssignedIssues: number
  maxOpenedPrs: number
  unassignOthers: boolean
}

type RolesConfig = {
  [role: string]: RoleConfig
}

const loadRolesConfig = async (): Promise<RolesConfig> => {
  try {
    const config = yaml.load(`
    admin:
      max-assigned-issues: 10
      max-opened-prs: 5
      unassign-others: true
    maintainer:
      max-assigned-issues: 5
      max-opened-prs: 3
      unassign-others: false
    developer:
      max-assigned-issues: 3
      max-opened-prs: 2
      unassign-others: false
    default:
      max-assigned-issues: 1
      max-opened-prs: 1
      unassign-others: false
    `) as RolesConfig
    console.log('Loaded roles config:', config)
    return config
  } catch (error) {
    console.error(`Error loading YAML config: ${error}`)
    throw error
  }
}

async function countAssignedIssues(
  owner: string,
  repo: string,
  username: string
) {
  try {
    const { data } = await octokit.search.issuesAndPullRequests({
      q: `repo:${owner}/${repo} assignee:${username} is:issue is:open`,
    })
    return data.total_count
  } catch (error) {
    console.error(error)
    return 0
  }
}

async function getCommentorRole(
  owner: string,
  repo: string,
  username: string
): Promise<string> {
  try {
    const { data } = await octokit.repos.getCollaboratorPermissionLevel({
      owner,
      repo,
      username,
    })
    return data.permission // Can be "admin", "write", "read", "none"
  } catch (error) {
    console.error(error)
    return 'default'
  }
}

export async function POST(request: Request) {
  const rolesConfig = await loadRolesConfig()
  console.log('------------------Received a new comment------------------')
  const payload = await request.json()
  const commentBody = await payload.comment.body
  const assignRegex = /^\/assign\s+@(\w+)/
  const unassignRegex = /^\/unassign\s+@(\w+)/

  // Check if comment is an assign command
  if (assignRegex.test(commentBody)) {
    const matches = commentBody.match(assignRegex)
    if (matches) {
      const username = matches[1] // Extracted username from the command
      const issueNumber = payload.issue.number
      const owner = payload.repository.owner.login
      const repo = payload.repository.name

      try {
        const commentorRole = await getCommentorRole(owner, repo, username)
        const roleConfig = rolesConfig[commentorRole] || rolesConfig['default']
        const assignedIssuesCount = await countAssignedIssues(
          owner,
          repo,
          username
        )
        if (assignedIssuesCount >= roleConfig.maxAssignedIssues) {
          await octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number: issueNumber,
            body: `Sorry @${username}, you have already reached the maximum number of issues assigned to you. Please unassign yourself from some of the issues and try again.`,
          })
        } else if (commentorRole === 'default') {
          await octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number: issueNumber,
            body: `Sorry @${username}, you don't have permission to assign issues. Please ask a maintainer to assign you.`,
          })
        } else {
          console.log(
            `@${username} has the role of ${commentorRole} in ${repo}`
          )
          // Add assignee to the issue
          await octokit.rest.issues.addAssignees({
            owner,
            repo,
            issue_number: issueNumber,
            assignees: [username],
          })
          console.log(`Assigned @${username} to issue #${issueNumber}`)

          // Add label to the issue
          const labelResponse = await octokit.rest.issues.addLabels({
            owner,
            repo,
            issue_number: issueNumber,
            labels: ['assigned', 'in-progress'],
          })
          console.log(
            `Added labels to issue #${issueNumber}: ${labelResponse.data.map(
              (label) => label.name
            )}`
          )

          // print the count of assigned issues of user
          await new Promise((resolve) => setTimeout(resolve, 2000))
          const count = await countAssignedIssues(owner, repo, username)
          console.log(
            `@${username} now has ${count} open issues assigned in ${repo}`
          )
        }
      } catch (error) {
        console.error(
          `Failed to assign @${username} to issue #${issueNumber}: ${error}`
        )
      }
    }
    return NextResponse.json({ status: 'success' })
  } else if (unassignRegex.test(commentBody)) {
    const matches = commentBody.match(unassignRegex)
    if (matches) {
      const usernameWhichCommented = payload.comment.user.login
      const usernameToBeUnassigned = matches[1] // Extracted username from the command
      const issueNumber = payload.issue.number
      const owner = payload.repository.owner.login
      const repo = payload.repository.name

      try {
        const commentorRole = await getCommentorRole(
          owner,
          repo,
          usernameWhichCommented
        )
        if (commentorRole !== 'admin') {
          await octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number: issueNumber,
            body: `Sorry @${usernameWhichCommented}, you don't have permission to unassign issues. Please ask a maintainer to unassign you.`,
          })
        } else {
          await octokit.rest.issues.removeAssignees({
            owner,
            repo,
            issue_number: issueNumber,
            assignees: [usernameToBeUnassigned],
          })
          console.log(
            `Unassigned @${usernameToBeUnassigned} from issue #${issueNumber}`
          )
          // check number of assignees to the particaular issue
          const { data } = await octokit.rest.issues.get({
            owner,
            repo,
            issue_number: issueNumber,
          })
          if (data && data.assignees && data.assignees.length === 0) {
            await octokit.rest.issues.removeLabel({
              owner,
              repo,
              issue_number: issueNumber,
              name: 'assigned',
            })
            console.log(`Removed label 'assigned' from issue #${issueNumber}`)
            await octokit.rest.issues.removeLabel({
              owner,
              repo,
              issue_number: issueNumber,
              name: 'in-progress',
            })
            console.log(
              `Removed label 'in-progress' from issue #${issueNumber}`
            )
          }
        }
      } catch (error) {
        console.error(
          `Failed to assign @${usernameToBeUnassigned} to issue #${issueNumber}: ${error}`
        )
      }
    }
    return NextResponse.json({ status: 'success' })
  }
  return NextResponse.json({ status: 'error' })
}
