import { groupLabeledPullRequests, mergeBranches } from './src/lib'

/**
 * main
 * @description Fetches all PRs from repo with target label and merge each one to a temp branch.
 */
function main() {
    const branches = groupLabeledPullRequests();
    mergeBranches(branches);
}
main();
