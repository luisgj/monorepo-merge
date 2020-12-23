import { context, getOctokit } from '@actions/github';
import { getInput, setFailed } from '@actions/core';

/**
 * groupLabeledPullRequests
 * @description Fetches all PRs from repo with target label and merge each one to a temp branch.
 */
export const groupLabeledPullRequests = async function () {
    try {
        //get input from Github Job declaration
        var branches = [];
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
        //Fetch the current pull request
        const splitUrl = context.payload.comment.issue_url.split('/');
        const currentIssueNumber = parseInt(splitUrl[splitUrl.length - 1], 10)
        const currentPull = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: issueNumber
        });
        // Nothing to iterate. Just add the current head branch to merge
        if(excludeCurrent !== "true" && data.total_count <= 0) {
            return [currentPull.data.head.ref];
        }

        if(data.total_count > 0) {
            const branches = data.items.reduce(function(result, element) {
                console.log(element);
                result.push(element);
                return result;
            }, []);
        }
        
        return branches;
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