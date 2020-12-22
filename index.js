import { context, getOctokit } from '@actions/github';
import { getInput, setFailed } from '@actions/core';

/**
 * groupLabeledPullRequests
 * @description Fetches all PRs from repo with target label and merge each one to a temp branch.
 */
async function groupLabeledPullRequests() {
    try {
        const token = getInput('repo-token');
        const label = getInput('target-label');
        const q = `is:pr+label:${label}+repo:${context.repo}+state:open`;
        const octokit = getOctokit(token);
        const result = await octokit.search.issuesAndPullRequests({
            q,
            sort: 'created',
            order: 'desc',
        });
        console.log(result);
    } catch (e) {
        setFailed(e.message);
    }
}

groupLabeledPullRequests();