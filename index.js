import { groupLabeledPullRequests } from './src/merge'
import { getInput, setFailed, info, debug } from '@actions/core';
import { getOctokit, context } from '@actions/github';

/**
 * main
 * @description Fetches all PRs from repo with target label and merge each one to a temp branch.
 */
async function main() {
    info(JSON.stringify(context));
    const triggerComment = getInput('trigger-comment');
    const token = getInput('repo-token');
    const octokit = getOctokit(token);
    //TODO remove ugly switch statement replace with cnfigurable command list
    switch(triggerComment) {
        case "/stage-deploy":
            info('Init group and merge deployment process.')
            await groupLabeledPullRequests(octokit);
            break;
        case "/approve":
            info('Init sign Off process.')
            break;
        case "/rollback":
            info('Init rollback process.')
            await groupLabeledPullRequests(octokit, true);
            break;
        default:
            info(triggerComment);
            setFailed('The command is not supported.'); 
            break;
    }
}
main();
