import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import * as sinon from "sinon";
import * as vscode from "vscode";

// get current working folder path
const workspaceFolder = path.join(
  __dirname,
  "..",
  "..",
  "src",
  "test",
  "resources"
);

suite("Extension Test Suite", () => {
  test("Colors used in file - 1", async () => {
    const filePath = path.join(
      workspaceFolder,
      "scenario1",
      "folder1",
      "colorUsage.js"
    );
    const uri = vscode.Uri.file(filePath);
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);
    const result = (await vscode.commands.executeCommand(
      "ColorAnalyzer.analyzeFile",
      uri.fsPath
    )) as Map<string, number>;
    assert.strictEqual(result.size, 4);
    assert.strictEqual(result.get("blue"), 4);
    assert.strictEqual(result.get("grey"), 3);
    assert.strictEqual(result.get("orange"), 1);
    assert.strictEqual(result.get("purple"), 2);
  });
  test("Colors used in file - 2", async () => {
    const filePath = path.join(
      workspaceFolder,
      "scenario1",
      "folder1",
      "colors.js"
    );
    const uri = vscode.Uri.file(filePath);
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);
    const result = (await vscode.commands.executeCommand(
      "ColorAnalyzer.analyzeFile",
      uri.fsPath
    )) as Map<string, number>;
    assert.strictEqual(result.size, 3);
    assert.strictEqual(result.get("#FF0000"), 1);
    assert.strictEqual(result.get("#00FF00"), 1);
    assert.strictEqual(result.get("#0000FF"), 1);
  });

  test("Colors used in directory - 1", async () => {
    const folderPath = path.join(workspaceFolder, "scenario1", "folder1");
    const uri = vscode.Uri.file(folderPath);
    const result = (await vscode.commands.executeCommand(
      "ColorAnalyzer.analyzeFolder",
      uri
    )) as any[];
    assert.strictEqual(result.length > 0, true);
    const colors = result.find(
      (item) => item.filePath === path.join(folderPath, "colors.js")
    );
    assert.strictEqual(colors.colorUsed.includes("#FF0000"), true);
    assert.strictEqual(colors.colorUsed.includes("#00FF00"), true);
    assert.strictEqual(colors.colorUsed.includes("#0000FF"), true);
    const colors2 = result.find(
      (item) => item.filePath === path.join(folderPath, "colors2.js")
    );
    assert.strictEqual(colors2.colorUsed.includes("#FF0000"), true);
    assert.strictEqual(colors2.colorUsed.includes("#00FF00"), true);
    assert.strictEqual(colors2.colorUsed.includes("#0000FF"), true);
    assert.strictEqual(colors2.colorUsed.includes("#FFFF00"), true);
    assert.strictEqual(colors2.colorUsed.includes("#00FFFF"), true);
    const colorUsage = result.find(
      (item) => item.filePath === path.join(folderPath, "colorUsage.js")
    );
    assert.strictEqual(colorUsage.colorUsed.includes("blue"), true);
    assert.strictEqual(colorUsage.colorUsed.includes("grey"), true);
    assert.strictEqual(colorUsage.colorUsed.includes("orange"), true);
    assert.strictEqual(colorUsage.colorUsed.includes("purple"), true);
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
