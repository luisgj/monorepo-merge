import { context } from '@actions/github';
import { getInput, setFailed } from '@actions/core';

/**
 * groupLabeledPullRequests
 * @description Fetches all PRs from repo with target label and merge each one to a temp branch.
 * @arg {object} octokit Github Octokit Rest client
 */
export const groupLabeledPullRequests = async function (octokit) {
    //get current pull request number
    const splitUrl = context.payload.comment.issue_url.split('/');
    const currentIssueNumber = parseInt(splitUrl[splitUrl.length - 1], 10)
    //create tempBranchName
    const tempBranch = `temp-ci-${context.repo.repo}-${Date.now()}`;
    try {
        //get input from Github Job declaration
        var pulls = [];
        var comment = '### Going to merge pull requests:\n';
        const label = getInput('target-label');
        const excludeCurrent = getInput('exclude-current');
        //Create search query
        const q = `is:pull-request label:${label} repo:${context.repo.owner}/${context.repo.repo} state:open`;
        //Call github API through the octokit client
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
        const { data: currentPull } = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: currentIssueNumber
        });
        // Nothing to iterate. Just add the current pull data to merge
        if(excludeCurrent !== 'true' && data.total_count <= 0) {
            comment += `- ${currentPull.html_url}\n`;
            createComment(octokit, currentIssueNumber, comment);
            return [currentPull];
        }
        //iterate over selected PRs
        if(data.total_count > 0) {
            if(excludeCurrent !== 'true') {
                console.log('Pushing current PR to array');
                comment += `- ${currentPull.html_url}\n`;
                pulls.push(currentPull);
            }
            for (const item of data.items) {
                if (item.number !== currentIssueNumber) {
                    const accPull = await octokit.request(`GET /repos/{owner}/{repo}/pulls/{pull_number}`, {
                        owner: context.repo.owner,
                        repo: context.repo.repo,
                        pull_number: item.number
                    });
                    console.log(`Pushing External PR #${item.number} to array`);
                    comment += `- ${item.html_url}\n`;
                    pulls.push(accPull.data);
                }
            }
        }
        await createComment(octokit, currentIssueNumber, comment);
        await mergeBranches(octokit, pulls, tempBranch);
    } catch (e) {
        if (e.message === "Merge conflict") {
            console.log("Merge conflict error.")
            //Add label
        }
        const message = `:ghost: Merge failed with error:\n\`\`\`shell\n${e.message}\n\`\`\``;
        await createComment(octokit, currentIssueNumber, message);
        await cleanup(octokit, tempBranch);
        setFailed(e.message);
    }
};

/**
 * mergeBranches
 * @description Merge the the head branches in a PR array into a temp branch.
 * @arg {array} pulls Array of pullr request objects.
 * @arg {object} octokit Github Octokit Rest client.
 * @arg {string} tempBranch Temporal branch to merge the grouped heads.
 */
const mergeBranches = async function (octokit, pulls, tempBranch) {
    //get latest main branch sha.
    const mainBranchName = getInput('main-branch');
    const integrationBranchName = getInput('integration-branch');
    const { data: { commit: { sha } } } = await octokit.request('GET /repos/{owner}/{repo}/branches/{branch}', {
        owner: context.repo.owner,
        repo: context.repo.repo,
        branch: mainBranchName
    });
    //create temp branch from main branch.
    await octokit.request('POST /repos/{owner}/{repo}/git/refs', {
        owner: context.repo.owner,
        repo: context.repo.repo,
        ref: `refs/heads/${tempBranch}`,
        sha: sha
    });
    //merge group branches to tmp branch
    for (const pull of pulls) {
        const { head: { ref: headBranch }, number } = pull;
        console.log(`Merging Pull Request #${number} into ${tempBranch}`);
        await octokit.request('POST /repos/{owner}/{repo}/merges', {
            owner: context.repo.owner,
            repo: context.repo.repo,
            base: tempBranch,
            head: headBranch,
        });
        console.log(`Merged Pull Request #${number} into ${tempBranch} successfully.`);
    }
    //merge into integration branch
    console.log(`Merging branch #${tempBranch} into ${integrationBranchName}.`);
    await octokit.request('POST /repos/{owner}/{repo}/merges', {
        owner: context.repo.owner,
        repo: context.repo.repo,
        base: integrationBranchName,
        head: tempBranch,
    });
    console.log(`Merged branch #${tempBranch} into ${integrationBranchName} successfully.`);
    await cleanup(octokit, tempBranch);
};

/**
 * createComment
 * @description Create a comment in the current PR 
 * @param {octokit} octokit 
 * @param {string} pull 
 * @param {string} message 
 */
const createComment = async function(octokit, pull, message) {
    try {
        await octokit.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: pull,
            body: message,
          });
    } catch(e) {
        console.log('Error creating comment')
        console.log(e.message);
    }
};

/**
 * cleanup
 * @description 
 * @param {*} octokit 
 * @param {*} tempBranch 
 */
const cleanup = async function(octokit, tempBranch) {
    try {
        console.log(`Deleting temp branch: ${pull}`);
        await octokit.request('DELETE /repos/{owner}/{repo}/git/refs/{ref}', {
            owner: context.repo.owner,
            repo: context.repo.repo,
            ref: `refs/head/${tempBranch}`
        });
    } catch(e) {
        console.log('Error deleting temp branch.')
        console.log(e.message);
    }
}