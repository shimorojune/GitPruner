import * as vscode from "vscode";
import { GitExtension } from "./ext/git";

// This method is called when your extension is activated
export async function activate(context: vscode.ExtensionContext) {
  // VARIABLES
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  const gitLensExtension = vscode.extensions.getExtension("eamodio.gitlens");

  // Customize the status bar item properties
  statusBarItem.text = "Prune";
  statusBarItem.tooltip = "Run git prune command";
  statusBarItem.command = "extension.prune"; // Optional: Associate a command with the status bar item

  // LOGIC
  if (!gitLensExtension) {
    // GitLens is not installed
    vscode.window
      .showInformationMessage(
        "GitLens extension is required for this extension. Do you want to install it?",
        "Yes",
        "No"
      )
      .then((choice) => {
        if (choice === "Yes") {
          vscode.commands
            .executeCommand(
              "workbench.extensions.installExtension",
              "eamodio.gitlens"
            )
            .then(() => {
              vscode.window
                .showInformationMessage(
                  "Reload window to restart GitPruner?",
                  "Yes",
                  "No"
                )
                .then((choice) => {
                  if (choice === "Yes") {
                    vscode.commands.executeCommand(
                      "workbench.action.reloadWindow"
                    );
                  }
                });
            });
        }
      });
  } else {
    // Show the status bar item
    statusBarItem.show();
  }

  // REGISTER COMMANDS
  context.subscriptions.push(
    // COMMANDS
    vscode.commands.registerCommand("extension.prune", prune)
  );
}

export const prune = async () => {
  // VARIABLES
  const gitExtension =
    vscode.extensions.getExtension<GitExtension>("vscode.git");

  // LOGIC
  if (gitExtension && gitExtension.isActive) {
    const git = gitExtension.exports.getAPI(1);
    const repository = git.repositories[0];
    if (!!repository) {
      vscode.window
        .withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Prunning repository...",
            cancellable: false,
          },
          () => {
            return new Promise(async (resolve) => {
              // fetching the latest branch changes
              await repository.fetch({
                prune: true,
              });
              resolve("");
            });
          }
        )
        .then(
          () => {
            // Task completed successfully
          },
          (error) => {
            // Task encountered an error
            vscode.window.showErrorMessage(
              "Repository prune failed: " + error.message
            );
          }
        );
    }
  }
};

// This method is called when your extension is deactivated
export function deactivate() {}
