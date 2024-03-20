import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';

export function activate(context: vscode.ExtensionContext) {
  // Register the Sidebar Panel
  const sidebarProvider = new SidebarProvider(context.extensionUri);

  const subscriptions = [
    vscode.window.registerWebviewViewProvider('ColorAnalyzer-sidebar', sidebarProvider),
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (!editor) return
      sidebarProvider._editor = editor;
      sidebarProvider.updateWebviewForColorUsedInFile();
      const projectDirPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath
      if (!projectDirPath) return
      sidebarProvider.updateWebviewForColorUsedInProject(projectDirPath);
    }),
    vscode.workspace.onDidSaveTextDocument((event) => {
      sidebarProvider.updateWebviewForColorUsedInFile();
      const projectDirPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath
      if (!projectDirPath) return
      sidebarProvider.updateWebviewForColorUsedInProject(projectDirPath);
    }),
    /* FOR TESTING */
    vscode.commands.registerCommand('ColorAnalyzer.getColorsUsedInFile', () => {
      const result = sidebarProvider.updateWebviewForColorUsedInFile();
      vscode.window.showInformationMessage(JSON.stringify(result))
    }),
    vscode.commands.registerCommand('ColorAnalyzer.getColorsUsedInDir', (selectedDir: vscode.Uri | undefined) => {
      if (!selectedDir) return
      const result = sidebarProvider.updateWebviewForColorUsedInProject(selectedDir.fsPath);
      vscode.window.showInformationMessage(JSON.stringify(result))
    })
  ];
  subscriptions.forEach((item) => context.subscriptions.push(item));
}

// this method is called when your extension is deactivated
export function deactivate() {}
