import path from 'path';
import { describe, expect, test } from 'vitest';
import { getColorUsedInContent } from '../helper';
import fs from 'fs';

const __dirname = path.resolve();
const folderDirectory = path.join(__dirname, 'src', 'unit-tests');

describe('Extract colors in file', () => {
  test('scenario 1', () => {
    const input = `
    rgb(111,111,111,111)
    rgb(1,1,1,1,1)
    `;
    const colorUsage = getColorUsedInContent(input);
    expect(colorUsage).toContain('rgb(111,111,111,111)');
  });

  test('scenario 1', () => {
    const input = `
    red
    rgb(1,1,1,1,1)
    `;
    const colorUsage = getColorUsedInContent(input);
    expect(colorUsage).toContain('red');
  });
});

describe('Get color usage', () => {
  test('scenario 1', () => {
    const file = path.join(folderDirectory, 'scenario1.js');
    const content = fs.readFileSync(file, 'utf8');
    const colorUsage = getColorUsedInContent(content);
    expect(colorUsage).toContain('rgb(0,0,0)');
    expect(colorUsage).toContain('#343434');
  });

  test('scenario 2', () => {
    const file = path.join(folderDirectory, 'scenario2.js');
    const content = fs.readFileSync(file, 'utf8');
    const colorUsage = getColorUsedInContent(content);
    expect(colorUsage).toContain('red');
    expect(colorUsage).toContain('black');
  });
});
