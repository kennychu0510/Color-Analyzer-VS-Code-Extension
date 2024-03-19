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
    expect(Array.from(colorUsage.keys())).toContain('rgb(111,111,111,111)');
    expect(colorUsage.size).toBe(1)
  });

  test('scenario 1', () => {
    const input = `
    red
    rgb(1,1,1,1,1)
    `;
    const colorUsage = getColorUsedInContent(input);
    expect(Array.from(colorUsage.keys())).toContain('red');
    expect(colorUsage.size).toBe(1)
  });
});

describe('Get color usage', () => {
  test('scenario 1', () => {
    const file = path.join(folderDirectory, 'scenario1.js');
    const content = fs.readFileSync(file, 'utf8');
    const colorUsage = getColorUsedInContent(content);
    expect(Array.from(colorUsage.keys())).toContain('rgb(0,0,0)');
    expect(Array.from(colorUsage.keys())).toContain('#343434');
    expect(colorUsage.size).toBe(2)
  });

  test('scenario 2', () => {
    const file = path.join(folderDirectory, 'scenario2.js');
    const content = fs.readFileSync(file, 'utf8');
    const colorUsage = getColorUsedInContent(content);
    expect(Array.from(colorUsage.keys())).toContain('red');
    expect(Array.from(colorUsage.keys())).toContain('black');
    expect(colorUsage.size).toBe(2)
  });
});
