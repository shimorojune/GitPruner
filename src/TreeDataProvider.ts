import * as vscode from "vscode";
import { GitExtension, Ref, Repository } from "./ext/git.d";

export class GitCommitsProvider implements vscode.TreeDataProvider<Branch> {
  private _onDidChangeTreeData: vscode.EventEmitter<Branch | undefined> =
    new vscode.EventEmitter<Branch | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Branch | undefined> =
    this._onDidChangeTreeData.event;

  private observer?: vscode.Disposable;
  private wasRefresh = true;

  _observeRepositoryState(repository: Repository) {
    this.observer = repository.state.onDidChange(() => {
      if (this.wasRefresh) {
        this.wasRefresh = false;
      } else {
        this.refresh();
      }
    });
  }

  refresh(): void {
    this.wasRefresh = true;
    // this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Branch): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: Branch): Promise<Branch[]> {
    const gitExtension =
      vscode.extensions.getExtension<GitExtension>("vscode.git");

    if (gitExtension && gitExtension.isActive) {
      const git = gitExtension.exports.getAPI(1);

      const repository = git.repositories[0];

      if (repository) {
        if (!this.observer) {
          this._observeRepositoryState(repository);
        }
        const allBranches = await repository.getBranches({ remote: true });
        const localBranches = allBranches.filter(
          (branchData) => branchData.type === 0
        );
        const remoteBranches = allBranches.filter(
          (branchData) => branchData.type === 1
        );
        const staleBranches: Ref[] = [];
        localBranches.map((localBranchData) => {
          const instanceOfLocalBranchInRemote = remoteBranches.find(
            (remoteBranchData) =>
              localBranchData.name &&
              remoteBranchData.name?.endsWith(localBranchData.name)
          );
          if (instanceOfLocalBranchInRemote === undefined) {
            staleBranches.push(localBranchData);
          }
        });
        console.log({ staleBranches });
        return repository.log().then((logs) => {
          return logs.map(
            (log) => new Branch(log.message, log.hash, log.authorEmail)
          );
        });
      }
    }

    return Promise.resolve([]);
  }
}

export class Branch extends vscode.TreeItem {
  constructor(message: string, hash: string, email?: string) {
    super(message);

    if (email) {
      this.tooltip = email;
      this.iconPath = new vscode.ThemeIcon("git-branch");
    }
  }
}
