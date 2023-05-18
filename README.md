<br />

![Logo](https://github.com/shimorojune/git-fetch-pruner/blob/master/assets/images/logo/logo-with-text.png?raw=true)

<br />

# GitPruner

Extension to prune the current git repository. Mitigates the refresh bug (untracked branches are not updated locally when its remote branch has been deleted) in traditional tools like [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens).

## Features

> NOTE: GitPruner needs [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens) extension to be installed.

Once installed, the extension creates a status bar button "Prune" which can be used to prune the current repository.

## Release Notes

### 1.0.0

Initial release of extension with the ability to delete and copy the name of stale branches.

### 1.1.0

- Auto refresh disabled due to unnecessary fetch calls running.
- Removed "Untracked Braches" since stale branches can be viewed using the GitLens extension.
- Added "Prune" status bar icon to prune the current repository.

### 1.1.1

- README.md update

**Live long and prosper - without stale branches now!**
