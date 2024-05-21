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
