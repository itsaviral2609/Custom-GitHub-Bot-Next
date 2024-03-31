import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.KDB_BOT_GITHUB_TOKEN,
});

export default octokit;
