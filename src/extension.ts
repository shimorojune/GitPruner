import * as vscode from "vscode";
import { Ref } from "./ext/git";
import {
  Branch,
  UntrackedBranchesProvider,
} from "./providers/UntrackedBranchesProvider";

// This method is called when your extension is activated
export async function activate(context: vscode.ExtensionContext) {
  // VARIABLES
  let untrackedBranchesTreeView: vscode.TreeView<Branch>;

  // HANDLERS
  const setUntrackedBranchesHandler = (untrackedBranches: Ref[]) => {
    if (!!untrackedBranchesTreeView) {
      if (untrackedBranches.length === 0) {
        untrackedBranchesTreeView.message =
          "No untracked branches could be found";
      } else {
        untrackedBranchesTreeView.message = "";
      }
    }
  };

  // VARIABLES
  const gitExtension = vscode.extensions.getExtension("vscode.git");
  const untrackedBranchProvider = new UntrackedBranchesProvider({
    setUntrackedBranches: setUntrackedBranchesHandler,
  });

  // LOGIC
  if (!gitExtension || !gitExtension.isActive) {
    return;
  }

  // VIEWS
  untrackedBranchesTreeView = vscode.window.createTreeView(
    "untrackedBranches",
    {
      treeDataProvider: untrackedBranchProvider,
      showCollapseAll: false,
    }
  );

  context.subscriptions.push(
    // VIEWS
    untrackedBranchesTreeView,

    // COMMANDS
    vscode.commands.registerCommand("untrackedBranches.refresh", () =>
      untrackedBranchProvider.refresh()
    ),
    vscode.commands.registerCommand(
      "untrackedBranches.copy",
      (item: Branch) => {
        untrackedBranchProvider.copyBranchNameToClipboard(item);
      }
    ),
    vscode.commands.registerCommand(
      "untrackedBranches.deleteBranch",
      (item: Branch) => untrackedBranchProvider.deleteBranch(item)
    )
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
