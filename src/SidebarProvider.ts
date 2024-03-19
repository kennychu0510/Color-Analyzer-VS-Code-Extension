import * as vscode from 'vscode';
import { getColorUsageInDir, getColorUsedInContent } from './helper';

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;
  _editor?: vscode.TextEditor;

  constructor(private readonly _extensionUri: vscode.Uri) {
    this._editor = vscode.window.activeTextEditor;
  }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Listen for messages from the Sidebar component and execute action
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'onFetchColorUsed':
          this.updateWebviewForColorUsedInProject();
          this.updateWebviewForColorUsedInFile();
          break;
        case 'searchForColor':
          const color = data.value;
          await vscode.commands.executeCommand('editor.actions.findWithArgs', { searchString: color });
          await vscode.commands.executeCommand('editor.action.nextMatchFindAction');
          break;
        case 'goToColor':
          const filePath = data.value.path;
          const uri = vscode.Uri.file(filePath);
          await vscode.commands.executeCommand('vscode.open', uri);
          await vscode.commands.executeCommand('editor.actions.findWithArgs', { searchString: data.value.color });
          await vscode.commands.executeCommand('editor.action.nextMatchFindAction');
          break;
      }
    });
  }

  public updateWebviewForColorUsedInProject() {
    const projectDirPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath
    if (!projectDirPath) return
    const colorUsed = this.getColorUsedInProject(projectDirPath);
    this._view?.webview.postMessage({
      type: 'onReceiveColorsUsedInProject',
      value: JSON.stringify({
        projectDir: projectDirPath,
        colorUsed,
      }),
    });
  }

  public updateWebviewForColorUsedInFile() {
    const path = vscode.window.activeTextEditor?.document.uri.fsPath;
    if (!path) return;
    const colorUsed = this.getColorsUsedInEditor();
    this._view?.webview.postMessage({
      type: 'onReceiveColorsUsedInFile',
      value: JSON.stringify(
        {
          filePath: path,
          colorUsage: Array.from(colorUsed.entries())
        },
      ),
    });
  }

  public getColorUsedInProject(projectDirPath: string) {
    if (!projectDirPath) return [];
    const result = getColorUsageInDir(projectDirPath, getExtensions(), getDirectoryToIgnore());
    return result;
  }

  private getColorsUsedInEditor(): Map<String, number> {
    if (this._editor) {
      // get content of the active file
      const content = this._editor.document.getText();
      const colorsUsed = getColorUsedInContent(content);
      return colorsUsed;
    }
    return new Map();
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    //@ts-ignore
    const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
    //@ts-ignore
    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
    //@ts-ignore
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'compiled/sidebar.js'));
    //@ts-ignore
    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'compiled/sidebar.css'));

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
                <link href="${styleMainUri}" rel="stylesheet">
                <script nonce="${nonce}">
                    const tsvscode = acquireVsCodeApi();
                </script>

			</head>
            <body>
				<script nonce="${nonce}" src="${scriptUri}"></link>
			</body>
			</html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function getExtensions(): string[] {
  const extensions = vscode.workspace.getConfiguration('ColorAnalyzer').get('filesToScan') as string[] | undefined;
  return extensions ?? [];
}

export function getDirectoryToIgnore(): string[] {
  const directories = vscode.workspace.getConfiguration('ColorAnalyzer').get('directoriesToIgnore') as string[] | undefined;
  return directories ?? [];
}