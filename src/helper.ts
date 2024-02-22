import * as fs from 'fs';
import * as path from 'path';
import { ColorUsedInFile } from './model';

const color_name_array = ["aliceblue","antiquewhite","aqua","aquamarine","azure","beige","bisque","black","blanchedalmond","blue","blueviolet","brown","burlywood","cadetblue","chartreuse","chocolate","coral","cornflowerblue","cornsilk","crimson","cyan","darkblue","darkcyan","darkgoldenrod","darkgray","darkgreen","darkgrey","darkkhaki","darkmagenta","darkolivegreen","darkorange","darkorchid","darkred","darksalmon","darkseagreen","darkslateblue","darkslategray","darkslategrey","darkturquoise","darkviolet","deeppink","deepskyblue","dimgray","dimgrey","dodgerblue","firebrick","floralwhite","forestgreen","fuchsia","gainsboro","ghostwhite","gold","goldenrod","gray","green","greenyellow","grey","honeydew","hotpink","indianred","indigo","ivory","khaki","lavender","lavenderblush","lawngreen","lemonchiffon","lightblue","lightcoral","lightcyan","lightgoldenrodyellow","lightgray","lightgreen","lightgrey","lightpink","lightsalmon","lightseagreen","lightskyblue","lightslategray","lightslategrey","lightsteelblue","lightyellow","lime","limegreen","linen","magenta","maroon","mediumaquamarine","mediumblue","mediumorchid","mediumpurple","mediumseagreen","mediumslateblue","mediumspringgreen","mediumturquoise","mediumvioletred","midnightblue","mintcream","mistyrose","moccasin","navajowhite","navy","oldlace","olive","olivedrab","orange","orangered","orchid","palegoldenrod","palegreen","paleturquoise","palevioletred","papayawhip","peachpuff","peru","pink","plum","powderblue","purple","red","rosybrown","royalblue","saddlebrown","salmon","sandybrown","seagreen","seashell","sienna","silver","skyblue","slateblue","slategray","slategrey","snow","springgreen","steelblue","tan","teal","thistle","tomato","turquoise","violet","wheat","white","whitesmoke","yellow","yellowgreen"]

export function getAllFilesInDirectory(directory: string) {
  const fileExtensions = ['.js', '.jsx', '.tsx', 'ts'];
  const foundFiles: string[] = [];

  function traverseDirectory(currentPath: string) {
    const files = fs.readdirSync(currentPath);

    files.forEach((file) => {
      const filePath = path.join(currentPath, file);
      const fileStat = fs.statSync(filePath);

      if (fileStat.isDirectory()) {
        traverseDirectory(filePath); // Recursively traverse nested directories
      } else if (fileExtensions.includes(path.extname(file))) {
        foundFiles.push(filePath);
      }
    });
  }

  traverseDirectory(directory);
  return foundFiles;
}

export function getColorUsageInDir(dirPath: string): ColorUsedInFile[] {
  const result: ColorUsedInFile[] = [];
  const files = getAllFilesInDirectory(dirPath);
  files.forEach((file) => {
    const fileContent = fs.readFileSync(file, 'utf8');
    const colorsUsed = getColorUsedInContent(fileContent);
    result.push({
      filePath: file,
      colorUsed: colorsUsed,
    });
  });
  return result;
}

const ColorRegex = /(?:#|0x)(?:[a-f0-9]{3}|[a-f0-9]{6})\b|(?:rgb|hsl)a?\([^\)]*\)/gi;
const ColorByNameRegex = new RegExp(`(?<![.])\\b(${color_name_array.join('|')})\\b`, 'gi')

export function getColorUsedInContent(fileContent: string): string[] {
  const colorsMatchedByRegex = fileContent.match(ColorRegex) || [];
  const colorsMatchedByName = fileContent.match(ColorByNameRegex) || [];

  return [...colorsMatchedByRegex, ...colorsMatchedByName]
}
