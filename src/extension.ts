import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';

export function activate(context: vscode.ExtensionContext) {
  // Register the Sidebar Panel
  const sidebarProvider = new SidebarProvider(context.extensionUri);

  const subscriptions = [
    vscode.window.registerWebviewViewProvider('ColorManager-sidebar', sidebarProvider),
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (!editor) return
      sidebarProvider._editor = editor;
      sidebarProvider.updateWebviewForColorUsedInFile();
      sidebarProvider.updateWebviewForColorUsedInProject();
    }),
    vscode.workspace.onDidSaveTextDocument((event) => {
      sidebarProvider.updateWebviewForColorUsedInFile();
      sidebarProvider.updateWebviewForColorUsedInProject();
    }),
  ];
  subscriptions.forEach((item) => context.subscriptions.push(item));
}

// this method is called when your extension is deactivated
export function deactivate() {}
