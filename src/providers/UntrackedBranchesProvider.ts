import * as vscode from "vscode";
import { GitExtension, Ref, Repository } from "../ext/git";

interface Args {
  setUntrackedBranches: (untrackedBranches: Ref[]) => void;
}

export class UntrackedBranchesProvider
  implements vscode.TreeDataProvider<Branch>
{
  public setUntrackedBranches: Args["setUntrackedBranches"];
  constructor(args: Args) {
    this.setUntrackedBranches = args.setUntrackedBranches;
  }
  // VARIABLES
  // global variable for observer for the respository state
  private observer?: vscode.Disposable;
  // used to stop the infinite loop that is created when we run the fetch command
  // which causes the observer to fire, which then again runs the fetch command
  private hasRefreshed = true;
  private gitExtension =
    vscode.extensions.getExtension<GitExtension>("vscode.git");
  private _onDidChangeTreeData: vscode.EventEmitter<Branch | undefined> =
    new vscode.EventEmitter<Branch | undefined>();
  readonly onDidChangeTreeData: vscode.Event<Branch | undefined> =
    this._onDidChangeTreeData.event;

  // HANDLERS
  /**
   * setting up auto refresh when the repository state changes
   */
  _observeRepositoryState(repository: Repository) {
    this.observer = repository.state.onDidChange(() => {
      if (this.hasRefreshed) {
        this.hasRefreshed = false;
      } else {
        this.refresh();
      }
    });
  }
  _computeUntrackedBranches(allBranches: Ref[]) {
    const localBranches = allBranches.filter(
      (branchData) => branchData.type === 0
    );
    const remoteBranches = allBranches.filter(
      (branchData) => branchData.type === 1
    );
    return localBranches.flatMap((localBranchData) => {
      const instanceOfLocalBranchInRemote = remoteBranches.find(
        (remoteBranchData) =>
          localBranchData.name &&
          remoteBranchData.name?.endsWith(localBranchData.name)
      );
      if (instanceOfLocalBranchInRemote === undefined) {
        return localBranchData;
      }
      return [];
    });
  }
  async refresh() {
    this.hasRefreshed = true;
    this._onDidChangeTreeData.fire(undefined);
  }
  copyBranchNameToClipboard(item: Branch) {
    const branchName = `${item.label}`;
    vscode.env.clipboard.writeText(branchName);
    vscode.window.showInformationMessage(
      `Branch name "${item.label}" has been copied!`
    );
  }
  async deleteBranch(item: Branch) {
    const branchName = `${item.label}`;
    if (this.gitExtension && this.gitExtension.isActive) {
      const git = this.gitExtension.exports.getAPI(1);
      const repository = git.repositories[0];
      // await repository.deleteBranch(branchName);
      vscode.window
        .showWarningMessage(
          `Are you sure you want to delete the branch "${branchName}"?`,
          "Yes",
          "No"
        )
        .then(async (answer) => {
          if (answer === "Yes") {
            await repository.deleteBranch(branchName);
            this.refresh();
            vscode.window.showInformationMessage(
              `Branch "${item.label}" has been deleted`
            );
          }
        });
    }
  }

  // VSCODE COMPONENT FUNCTIONS
  getTreeItem(element: Branch): vscode.TreeItem {
    return element;
  }
  async getChildren(): Promise<Branch[]> {
    if (this.gitExtension && this.gitExtension.isActive) {
      const git = this.gitExtension.exports.getAPI(1);
      const repository = git.repositories[0];
      if (!!repository) {
        // fetching the latest branch changes
        await repository.fetch({
          prune: true,
        });
        if (!this.observer) {
          this._observeRepositoryState(repository);
        }
        const allBranches = await repository.getBranches({ remote: true });
        const untrackedBranches = this._computeUntrackedBranches(allBranches);
        this.setUntrackedBranches(untrackedBranches);
        const currentBranch = repository.state.HEAD?.name ?? "Unknown Branch";
        return untrackedBranches.map((untrackedBranch) => {
          // VARIABLES
          const branchName = untrackedBranch.name ?? "Unknown Branch";
          const isThisCurrentBranch = currentBranch === branchName;
          const nodeTitle = branchName;
          const nodeToolTipMessage = `${branchName} branch is not available in your remote`;

          // DRAW
          return new Branch(nodeTitle, nodeToolTipMessage, isThisCurrentBranch);
        });
      }
    }

    return Promise.resolve([]);
  }
}

export class Branch extends vscode.TreeItem {
  constructor(
    title: string,
    toolTipMessage: string,
    isThisCurrentBranch: boolean
  ) {
    super(title);
    this.tooltip = toolTipMessage;
    this.iconPath = new vscode.ThemeIcon("git-branch");
    this.label = title;
    this.description = isThisCurrentBranch ? "Current Branch" : false;
    this.contextValue = isThisCurrentBranch ? "hideDeleteOption" : "";
    this.resourceUri = {
      authority: "",
      fragment: "",
      fsPath: "",
      path: "",
      query: "defaultasdf",
      scheme: "",
      toJSON: () => null,
      with: () => null as any,
    };
  }
}
