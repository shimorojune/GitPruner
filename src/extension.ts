import * as vscode from "vscode";
import {
  Branch,
  UntrackedBranchesProvider,
} from "./providers/UntrackedBranchesProvider";

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  // VARIABLES
  const gitExtension = vscode.extensions.getExtension("vscode.git");
  const untrackedBranchProvider = new UntrackedBranchesProvider();

  // LOGIC
  if (!gitExtension || !gitExtension.isActive) {
    return;
  }

  context.subscriptions.push(
    // VIEWS
    vscode.window.createTreeView("untrackedBranches", {
      treeDataProvider: untrackedBranchProvider,
      showCollapseAll: false,
    }),

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
