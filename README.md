# Group Pull Requests Github Action

A Javascript Github Action that fetches open pull requests with a specific label and returns the grouped source branches.

## Inputs

### `target-label`

**Required** The label that all Pull Requests must contain to be grouped.

### `repo-token`

**Required** The token secret stored in `secrets.GITHUB_TOKEN`

## Outputs

### `branches`

Grouped list of open branches with the same tag

## Example usage

```yaml
uses: luisgj/group-pull-requests@v1.0
with:
  detect-label: 'stage-ready'
  repo-token: '${{ secrets.GITHUB_TOKEN }}'
```
