import { groupLabeledPullRequests, mergeBranches } from './src/lib'
import { getInput } from '@actions/core';
import { getOctokit } from '@actions/github';

/**
 * main
 * @description Fetches all PRs from repo with target label and merge each one to a temp branch.
 */
async function main() {
    const token = getInput('repo-token');
    const octokit = getOctokit(token);
    const branches = await groupLabeledPullRequests(octokit);
    mergeBranches(octokit, branches);
}
main();
