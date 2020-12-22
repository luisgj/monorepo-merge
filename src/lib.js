import { context, getOctokit } from '@actions/github';
import { getInput, setFailed } from '@actions/core';

/**
 * groupLabeledPullRequests
 * @description Fetches all PRs from repo with target label and merge each one to a temp branch.
 */
export const groupLabeledPullRequests = async function () {
    try {
        //get input from Github Job declaration
        const token = getInput('repo-token');
        const label = getInput('target-label');
        const excludeCurrent = getInput('exclude-current');
        //Create Octokit client and search for Pull Requests
        const q = `is:pull-request label:${label} repo:${context.repo.owner}/${context.repo.repo} state:open`;
        const octokit = getOctokit(token);
        const { data } = await octokit.search.issuesAndPullRequests({
            q,
            sort: 'created',
            order: 'desc',
        });
        // We have detected to exclude the current branch, so we will build the default.
        if (excludeCurrent === "true" && data.total_count <= 0) {
            return "default"
        }
        console.log(JSON.stringify(data.items));
        return 'this are the branches'
    } catch (e) {
        setFailed(e.message);
    }
};
/**
 * mergeBranches
 * @description Merge the branches into a temp branch.
 */
export const mergeBranches = async function (branches) {
    console.log(branches);
};