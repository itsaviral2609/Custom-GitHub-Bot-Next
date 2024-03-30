import yaml from 'js-yaml'
import octokit from '@/lib/octokit'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import {
  CountAssignedIssues,
  GetCommentorRole,
  GitHubIssueEvent,
  RolesConfig,
} from '@/types'

const loadRolesConfig = (): RolesConfig => {
  try {
    const fileName = 'roles.yaml'
    const pathToFile = path.resolve('./public', fileName)
    const configFile = fs.readFileSync(pathToFile, 'utf8')

    const config = yaml.load(configFile) as RolesConfig
    console.log('Loaded roles config:', config)
    return config
  } catch (error) {
    console.error(`Error loading YAML config: ${error}`)
    throw error
  }
}

const countAssignedIssues: CountAssignedIssues = async (
  owner,
  repo,
  username
) => {
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

const getCommentorRole: GetCommentorRole = async (owner, repo, username) => {
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

// initialize roles config and assign/unassign regex
const rolesConfig = loadRolesConfig()
const assignRegex = /^\/assign\s+@(\w+)/
const unassignRegex = /^\/unassign\s+@(\w+)/

export async function POST(request: Request) {
  const payload = (await request.json()) as GitHubIssueEvent
  const commentBody = payload.comment.body
  const usernameCommented = payload.comment.user.login
  const issueNumber = payload.issue.number
  const owner = payload.repository.owner.login
  const repo = payload.repository.name

  // Check if comment is an assign command
  if (assignRegex.test(commentBody)) {
    const matches = commentBody.match(assignRegex)
    if (matches) {
      const username = matches[1] // Extracted username from the command
      try {
        const commentorRole = await getCommentorRole(
          owner,
          repo,
          usernameCommented
        )
        const roleConfig = rolesConfig[commentorRole] || rolesConfig['default']
        const assignedIssuesCount = await countAssignedIssues(
          owner,
          repo,
          username
        )
        if (commentorRole === 'default') {
          await octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number: issueNumber,
            body: `Sorry @${usernameCommented}, you don't have permission to assign issues`,
          })
        } else if (assignedIssuesCount >= roleConfig.maxAssignedIssues) {
          await octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number: issueNumber,
            body: `Sorry ${usernameCommented}, you can't assign ${username} to this issue because they already have ${assignedIssuesCount} open issues assigned in ${repo}.`,
          })
        } else {
          await octokit.rest.issues.addAssignees({
            owner,
            repo,
            issue_number: issueNumber,
            assignees: [username],
          })
          console.log(`Assigned @${username} to issue #${issueNumber}`)
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
        }
      } catch (error) {
        console.error(
          `Failed to assign @${username} to issue #${issueNumber}: ${error}`
        )
      }
    } else {
      console.error('Failed to match assign regex')
    }
    return NextResponse.json({ status: 'success' })
  } else if (unassignRegex.test(commentBody)) {
    const matches = commentBody.match(unassignRegex)
    if (matches) {
      const usernameToBeUnassigned = matches[1] // Extracted username from the command
      try {
        const commentorRole = await getCommentorRole(
          owner,
          repo,
          usernameCommented
        )
        if (commentorRole !== 'admin') {
          await octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number: issueNumber,
            body: `Sorry @${usernameCommented}, you don't have permission to unassign issues`,
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
    } else {
      console.error('Failed to match unassign regex')
    }
    return NextResponse.json({ status: 'success' })
  } else {
    console.error('Failed to match assign/unassign regex')
  }
  return NextResponse.json({ status: 'error' })
}
