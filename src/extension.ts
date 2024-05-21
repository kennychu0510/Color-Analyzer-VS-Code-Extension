import * as vscode from "vscode";
import { Mode, SidebarProvider } from "./SidebarProvider";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  // Register the Sidebar Panel
  const sidebarProvider = new SidebarProvider(context.extensionUri);
  const subscriptions = [
    vscode.window.registerWebviewViewProvider(
      "ColorAnalyzer-sidebar",
      sidebarProvider
    ),
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (!editor) return;
      sidebarProvider._editor = editor;
      if (sidebarProvider.mode === Mode.CurrentFile) {
        sidebarProvider.refresh();
      }
    }),
    vscode.workspace.onDidSaveTextDocument((event) => {
      sidebarProvider.refresh();
    }),
    vscode.commands.registerCommand(
      "ColorAnalyzer.analyzeFolder",
      async (selectedDir: vscode.Uri | undefined) => {
        if (!selectedDir) return;
        sidebarProvider.startLoading();
        await vscode.commands.executeCommand("ColorAnalyzer-sidebar.focus");
        sidebarProvider.analyzeFolder(selectedDir.fsPath);
      }
    ),
  ];
  subscriptions.forEach((item) => context.subscriptions.push(item));
}

// this method is called when your extension is deactivated
export function deactivate() {}
