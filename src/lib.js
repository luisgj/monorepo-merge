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
        //Create search query
        const q = `is:pull-request label:${label} repo:${context.repo.owner}/${context.repo.repo} state:open`;
        //Call github API through the octokit client
        const octokit = getOctokit(token);
        const { data } = await octokit.search.issuesAndPullRequests({
            q,
            sort: 'created',
            order: 'desc',
        });
        // We have detected to exclude the current branch, so we will build the default.
        if(excludeCurrent === "true" && data.total_count <= 0) {
            return "default";
        }
        // We exclude the current branch. Group all the other PRs.
        if(excludeCurrent === "true" && data.total_count > 0) {
            return "rollback";
        }
        //We need to fetch the fead branch for the current issue's PR.
        if(excludeCurrent !== "true") {
            const splitUrl = context.payload.comment.issue_url.split('/');
            const issueNumber = splitUrl[splitUrl.length - 1]
            console.log(issueNumber);
        }
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