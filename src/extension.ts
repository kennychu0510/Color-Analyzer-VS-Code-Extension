import * as vscode from "vscode";
import { SidebarProvider } from "./SidebarProvider";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  // Register the Sidebar Panel
  const sidebarProvider = new SidebarProvider(context.extensionUri);
  let selectedDirectory = "";

  const subscriptions = [
    vscode.window.registerWebviewViewProvider(
      "ColorAnalyzer-sidebar",
      sidebarProvider
    ),
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (!editor) return;
      sidebarProvider._editor = editor;
      sidebarProvider.refresh();
    }),
    vscode.workspace.onDidSaveTextDocument((event) => {
      sidebarProvider.refresh();
    }),
    vscode.commands.registerCommand(
      "ColorAnalyzer.analyzeFolder",
      async (selectedDir: vscode.Uri | undefined) => {
        if (!selectedDir) return;
        await vscode.commands.executeCommand("ColorAnalyzer-sidebar.focus");
        const projectDir = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        selectedDirectory = path.relative(projectDir || "", selectedDir.fsPath);
        sidebarProvider.analyzeFolder(selectedDir.fsPath);
      }
    ),
  ];
  subscriptions.forEach((item) => context.subscriptions.push(item));
}

// this method is called when your extension is deactivated
export function deactivate() {}
