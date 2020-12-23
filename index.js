import { groupLabeledPullRequests, mergeBranches } from './src/lib'

/**
 * main
 * @description Fetches all PRs from repo with target label and merge each one to a temp branch.
 */
async function main() {
    const branches = await groupLabeledPullRequests();
    mergeBranches(branches);
}
main();
