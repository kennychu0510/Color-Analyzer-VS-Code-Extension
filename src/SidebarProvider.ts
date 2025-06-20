import * as vscode from 'vscode';
import * as path from 'path';
import { getColorUsageInDir, getColorUsedInContent } from './helper';

export enum Mode {
  CurrentFile,
  CurrentProject,
  CustomDirectory,
}

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;
  _editor?: vscode.TextEditor;
  mode: Mode = Mode.CurrentFile;
  customDir: string = '';

  constructor(private readonly _extensionUri: vscode.Uri) {
    this._editor = vscode.window.activeTextEditor;
  }

  public refresh() {
    this.startLoading();
    if (this.mode === Mode.CurrentFile) {
      this.updateWebviewForColorUsedInFile();
    } else if (this.mode === Mode.CurrentProject) {
      this.updateWebviewForColorUsedInProject();
    } else if (this.mode === Mode.CustomDirectory) {
      this.mode = Mode.CustomDirectory;
      if (this.customDir) {
        this.updateWebviewForColorUsedInDir(this.customDir);
      }
    }
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
          await vscode.commands.executeCommand('editor.actions.findWithArgs', {
            searchString: color,
          });
          await vscode.commands.executeCommand('editor.action.nextMatchFindAction');
          break;
        case 'goToColor':
          const filePath = data.value.path;
          const uri = vscode.Uri.file(filePath);
          await vscode.commands.executeCommand('vscode.open', uri);
          await vscode.commands.executeCommand('editor.actions.findWithArgs', {
            searchString: data.value.color,
          });
          await vscode.commands.executeCommand('editor.action.nextMatchFindAction');
          break;
        case 'changeMode':
          this.mode = data.value;
          this.refresh();
          break;
        case 'copyColor':
          const colorToCopy = data.value;
          await vscode.env.clipboard.writeText(colorToCopy);
          vscode.window.showInformationMessage(`Copied color: ${colorToCopy}`);
          break;
      }
    });
  }

  public analyzeFolder(selectedDir: string) {
    this.mode = Mode.CustomDirectory;
    this.customDir = selectedDir;
    return this.updateWebviewForColorUsedInDir(selectedDir);
  }

  private updateWebviewForColorUsedInDir(dirPath: string) {
    const colorUsed = this.getColorUsedInDir(dirPath);
    this._view?.webview.postMessage({
      type: 'onReceiveColorsUsedInDir',
      value: JSON.stringify({
        rootDir: dirPath,
        colorUsed,
        relativeDir: path.relative(vscode.workspace.workspaceFolders?.[0].uri.fsPath || '', dirPath),
      }),
    });
    return colorUsed;
  }

  public startLoading() {
    this._view?.webview.postMessage({ type: 'startLoading' });
  }

  private updateWebviewForColorUsedInProject() {
    const projectDirPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (!projectDirPath) return;
    const colorUsed = this.getColorUsedInDir(projectDirPath);
    this._view?.webview.postMessage({
      type: 'onReceiveColorsUsedInProject',
      value: JSON.stringify({
        projectDir: projectDirPath,
        colorUsed,
      }),
    });
  }

  public updateWebviewForColorUsedInFile(selectedPath?: string) {
    const path = selectedPath ?? vscode.window.activeTextEditor?.document.uri.fsPath;
    if (!path) return;
    const colorUsed = this.getColorsUsedInEditor();
    this._view?.webview.postMessage({
      type: 'onReceiveColorsUsedInFile',
      value: JSON.stringify({
        filePath: path,
        colorUsage: Array.from(colorUsed.entries()),
      }),
    });
    return colorUsed;
  }

  public getColorUsedInDir(dirPath: string) {
    if (!dirPath) return [];
    const result = getColorUsageInDir(dirPath, getExtensions(), getDirectoryToIgnore());
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
    const styleResetUri = webview.asWebviewUri(
      //@ts-ignore
      vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css')
    );
    const styleVSCodeUri = webview.asWebviewUri(
      //@ts-ignore
      vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css')
    );
    const scriptUri = webview.asWebviewUri(
      //@ts-ignore
      vscode.Uri.joinPath(this._extensionUri, 'out', 'compiled/sidebar.js')
    );
    const styleMainUri = webview.asWebviewUri(
      //@ts-ignore
      vscode.Uri.joinPath(this._extensionUri, 'out', 'compiled/sidebar.css')
    );

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
