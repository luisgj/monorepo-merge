import { context, getOctokit } from '@actions/github';
import { getInput, setFailed } from '@actions/core';

/**
 * groupLabeledPullRequests
 * @description Fetches all PRs from repo with target label and merge each one to a temp branch.
 */
export const groupLabeledPullRequests = async function () {
    try {
        //get input from Github Job declaration
        var pulls = [];
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
        //Exclude the current branch, so we will build the default.
        if(excludeCurrent === "true" && data.total_count <= 0) {
            return "default";
        }
        //Fetch the current pull request
        const splitUrl = context.payload.comment.issue_url.split('/');
        const currentIssueNumber = parseInt(splitUrl[splitUrl.length - 1], 10)
        const currentPull = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: currentIssueNumber
        });
        // Nothing to iterate. Just add the current pull data to merge
        if(excludeCurrent !== 'true' && data.total_count <= 0) {
            return [currentPull.data];
        }
        //iterate over selected PRs
        if(data.total_count > 0) {
            if(excludeCurrent !== 'true') {
                pulls.push(currentPull.data)
            }
            pulls.concat(data.items.reduce(async function(accumulator, element) {
                if (element.number !== currentIssueNumber) {
                    const accPull = await octokit.request(`GET /repos/{owner}/{repo}/pulls/{pull_number}`, {
                        owner: context.repo.owner,
                        repo: context.repo.repo,
                        pull_number: element.number
                    });
                    console.log('Pushing External PR to array');
                    console.log(JSON.stringify(accPull));
                    accumulator.push(accPull);
                }
                return accumulator;
            }, []));
        }
        return pulls;
    } catch (e) {
        setFailed(e.message);
    }
};
/**
 * mergeBranches
 * @description Merge the the head branches in a PR array into a temp branch.
 * @arg pulls Array of pullr request objects.
 */
export const mergeBranches = async function (pulls) {
    console.log(JSON.stringify(pulls));
};