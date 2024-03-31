export type RoleConfig = {
  maxAssignedIssues: number
  maxOpenedPrs: number
  unassignOthers: boolean
}

export type RolesConfig = {
  [role: string]: RoleConfig
}

export type CountAssignedIssues = (
  owner: string,
  repo: string,
  username: string
) => Promise<number>

export type GetCommentorRole = (
  owner: string,
  repo: string,
  username: string
) => Promise<string>

export type CreateComment = (
  owner: string,
  repo: string,
  issueNumber: number,
  body: string
) => Promise<void>

export type GitHubIssueEvent = {
  action: string
  issue: Issue
  comment: Comment
  repository: Repository
  sender: User
}

export type Issue = {
  url: string
  repository_url: string
  labels_url: string
  comments_url: string
  events_url: string
  html_url: string
  id: number
  node_id: string
  number: number
  title: string
  user: User
  labels: Label[]
  state: string
  locked: boolean
  assignee: User | null
  assignees: User[]
  milestone: Milestone | null
  comments: number
  created_at: string
  updated_at: string
  closed_at: string | null
  author_association: string
  active_lock_reason: string | null
  body: string | null
  reactions: Reactions
  timeline_url: string
  performed_via_github_app: string | null
  state_reason: string | null
}

export type Comment = {
  url: string
  html_url: string
  issue_url: string
  id: number
  node_id: string
  user: User
  created_at: string
  updated_at: string
  author_association: string
  body: string
  reactions: Reactions
  performed_via_github_app: string | null
}

export type Repository = {
  id: number
  node_id: string
  name: string
  full_name: string
  private: boolean
  owner: User
  html_url: string
  description: string
  fork: boolean
  url: string
  forks_url: string
  keys_url: string
  collaborators_url: string
  teams_url: string
  hooks_url: string
  issue_events_url: string
  events_url: string
  assignees_url: string
  branches_url: string
  tags_url: string
  blobs_url: string
  git_tags_url: string
  git_refs_url: string
  trees_url: string
  statuses_url: string
  languages_url: string
  stargazers_url: string
  contributors_url: string
  subscribers_url: string
  subscription_url: string
  commits_url: string
  git_commits_url: string
  comments_url: string
  issue_comment_url: string
  contents_url: string
  compare_url: string
  merges_url: string
  archive_url: string
  downloads_url: string
  issues_url: string
  pulls_url: string
  milestones_url: string
  notifications_url: string
  labels_url: string
  releases_url: string
  deployments_url: string
  created_at: string
  updated_at: string
  pushed_at: string
  git_url: string
  ssh_url: string
  clone_url: string
  svn_url: string
  homepage: string | null
  size: number
  stargazers_count: number
  watchers_count: number
  language: string | null
  has_issues: boolean
  has_projects: boolean
  has_downloads: boolean
  has_wiki: boolean
  has_pages: boolean
  has_discussions: boolean
  forks_count: number
  mirror_url: string | null
  archived: boolean
  disabled: boolean
  open_issues_count: number
  license: License | null
  allow_forking: boolean
  is_template: boolean
  web_commit_signoff_required: boolean
  topics: string[]
  visibility: string
  forks: number
  open_issues: number
  watchers: number
  default_branch: string
}

export type User = {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
}

export type Label = {
  id?: number
  node_id?: string
  url?: string
  name: string
  description?: string | null
  color?: string
  default?: boolean
}

export type Milestone = {
  url: string
  html_url: string
  labels_url: string
  id: number
  node_id: string
  number: number
  state: string
  title: string
  description: string
  creator: User
  open_issues: number
  closed_issues: number
  created_at: string
  updated_at: string
  closed_at: string | null
  due_on: string | null
}

export type Reactions = {
  url: string
  total_count: number
  '+1': number
  '-1': number
  laugh: number
  hooray: number
  confused: number
  heart: number
  rocket: number
  eyes: number
}

export type License = {
  key: string
  name: string
  spdx_id: string | null
  url: string | null
  node_id: string
}
