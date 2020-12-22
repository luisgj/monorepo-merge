import { context, getOctokit } from '@actions/github';
import { getInput, setFailed } from '@actions/core';

module.exports = {
    /**
     * groupLabeledPullRequests
     * @description Fetches all PRs from repo with target label and merge each one to a temp branch.
     */
    groupLabeledPullRequests: async function () {
        try {
            const token = getInput('repo-token');
            const label = getInput('target-label');
            const q = `is:pr+label:${label}+repo:${context.repo}+state:open`;
            console.log(q);
            const octokit = getOctokit(token);
            const result = await octokit.search.issuesAndPullRequests({
                q,
                sort: 'created',
                order: 'desc',
            });
            console.log(result);
            return 'this are the branches'
        } catch (e) {
            setFailed(e.message);
        }
    },
    /**
     * mergeBranches
     * @description Merge the branches into a temp branch.
     */
    mergeBranches: async function (branches) {
        console.log(branches);
    },
}
