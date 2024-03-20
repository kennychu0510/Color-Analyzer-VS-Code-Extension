import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { ColorUsedInFile } from '../model';

const features = {
  styleExtraction: 'styles-extraction',
  copyStyles: 'copy-styles',
  removeStyles: 'remove-styles',
  batchClean: 'batchClean',
} as const;

// get current working folder path
const workspaceFolder = path.join(__dirname, '..', '..', 'src', 'test', 'resources');

suite('Color Analyzer Test', () => {
  const showInfoMessageSpy = sinon.spy(vscode.window, 'showInformationMessage');

  test('Scenario 1', async () => {
    showInfoMessageSpy.resetHistory();
    const filePath = path.join(workspaceFolder, 'scenario1', 'scenario1.js');
    const uri = vscode.Uri.file(filePath);
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand('ColorAnalyzer.getColorsUsedInFile');
    const colorUsed = new Map<string, number>();
    colorUsed.set('#343434', 1);
    const result = {
      filePath,
      colorUsage: Array.from(colorUsed.entries()),
    };
    assert.ok(showInfoMessageSpy.calledWith(JSON.stringify(result)));
  });

  test('Scenario 2', async () => {
    showInfoMessageSpy.resetHistory();
    const filePath = path.join(workspaceFolder, 'scenario1', 'scenario2.js');
    const uri = vscode.Uri.file(filePath);
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand('ColorAnalyzer.getColorsUsedInFile');
    const colorUsed = new Map<string, number>();
    colorUsed.set('red', 1);
    colorUsed.set('black', 1);
    const result = {
      filePath,
      colorUsage: Array.from(colorUsed.entries()),
    };
    assert.ok(showInfoMessageSpy.calledWith(JSON.stringify(result)));
  });

  test('Scenario 3 - Directory scan and ignore directories', async () => {
    showInfoMessageSpy.resetHistory();
    const filePath = path.join(workspaceFolder);
    const uri = vscode.Uri.file(filePath);
    // const document = await vscode.workspace.openTextDocument(uri);
    // await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand('ColorAnalyzer.getColorsUsedInDir', uri);
    const result: {
      projectDir: string;
      colorUsed: ColorUsedInFile[];
    } = {
      projectDir: filePath,
      colorUsed: [
        {
          filePath: path.join(workspaceFolder, 'scenario1', 'file1.js'),
          colorUsed: ['blue'],
        },
        {
          filePath: path.join(workspaceFolder, 'scenario1', 'scenario1.js'),
          colorUsed: ['#343434'],
        },
        {
          filePath: path.join(workspaceFolder, 'scenario1', 'scenario2.js'),
          colorUsed: ['red', 'black'],
        },
      ],
    };
    assert.ok(showInfoMessageSpy.calledWith(JSON.stringify(result)));
  });
});

//sleep function
function sleep(ms?: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms ?? 200);
  });
}

function deleteFilesRecursively(dirPath: string) {
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        deleteFilesRecursively(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
  }
}