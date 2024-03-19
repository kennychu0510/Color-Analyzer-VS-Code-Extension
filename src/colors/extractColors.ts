import { load } from 'cheerio';
import fs from 'fs';
import path from 'path';
import ColorsByNameJSON from './colors_by_name.json';

const html = fs.readFileSync('src/colors/colors.html', 'utf8');

const $ = load(html);

const rows = $('tr');

type Color = {
  name: string;
  hex: string;
  decimal: string;
};
const colors_by_name: Map<String, Color> = new Map();
const colors_by_hex: Map<String, Color> = new Map();
const colors_by_dec: Map<String, Color> = new Map();

rows.each((idx, item) => {
  if (idx === 0) return;
  const name = $(item).find('dfn').text().trim();
  const hex = $(item).find('td:nth-child(4)').text().trim();
  const decimal = $(item).find('td:nth-child(5)').text().trim();
  colors_by_name.set(name, {
    name: name,
    hex: hex,
    decimal: decimal,
  });
  colors_by_hex.set(hex, {
    name: name,
    hex: hex,
    decimal: decimal,
  });
  colors_by_dec.set(decimal, {
    name: name,
    hex: hex,
    decimal: decimal,
  });
});