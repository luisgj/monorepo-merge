import { groupLabeledPullRequests } from './src/merge'
import { getInput, setFailed, info, debug } from '@actions/core';
import { getOctokit, context } from '@actions/github';

/**
 * init
 * @description Fetches all PRs from repo with target label and merge each one to a temp branch.
 */
async function init() {
    //check event type to dispatch to proper action
    const eventName = context.eventName;
    if(eventName == 'issue_comment') {
        await commandDisptacher();
    } else if(eventName == 'pull_request') {
        await reValidation();
    } else {
        setFailed('This event is unsupported.');
    }
}

/**
 * commandDispatcher
 * @description Gets a triggered comment body command and dispatches an action.
 */
const commandDisptacher = async function() {
    const triggerComment = context.payload.comment.body;
    console.log(triggerComment);
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
};

/**
 * commandDispatcher
 * @description Gets a triggered comment body command and dispatches an action.
 */
const reValidation = async function() {

};

init();
