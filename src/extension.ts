// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { GitExtension } from "./ext/git";
import { GitCommitsProvider } from "./TreeDataProvider";

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  const gitExtension = vscode.extensions.getExtension("vscode.git");

  if (!gitExtension || !gitExtension.isActive) {
    return;
  }

  const gitApi = gitExtension.exports.getAPI(1);
  console.log(gitApi.repositories[0]);

  const gitCommitsProvider = new GitCommitsProvider();

  vscode.window.createTreeView("staleBranches", {
    treeDataProvider: gitCommitsProvider,
    showCollapseAll: false,
  });

  vscode.commands.registerCommand("staleBranches.refresh", () =>
    gitCommitsProvider.refresh()
  );

  vscode.commands.registerCommand("staleBranches.copy", () =>
    gitCommitsProvider.refresh()
  );

  vscode.commands.registerCommand("staleBranches.deleteBranch", () =>
    gitCommitsProvider.refresh()
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
