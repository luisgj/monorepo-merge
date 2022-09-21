# Monorepo merge Github Action

A Javascript Github Action with the intention of being used in monorepos to integrate many PRs into a single branch.

The action fetches open pull requests with a specific label and returns the grouped source branches.

## Inputs

### `target-label`

**Required** The label that all Pull Requests must contain to be grouped.

### `repo-token`

**Required** The token secret stored in `secrets.GITHUB_TOKEN`

### `main-branch`

**Required** Main branch of the repo

### `integration-branch`

**Required** A protected branch that serves as integration to a testing environment

## Outputs

### `temp-branch`

Temp branch name with the grouped heads merged in.

## Example usage

```yaml
uses: luisgj/monorepo-merge@v0.0.1
with:
  target-label: 'stage-ready'
  repo-token: '${{ secrets.GITHUB_TOKEN }}'
  integration-branch: 'staging'
  main-branch: 'main'
```
