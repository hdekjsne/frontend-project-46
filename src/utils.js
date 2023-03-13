import { cwd } from 'node:process';
import path from 'node:path';
import _ from 'lodash';

export function makeAbsolutePath(route) {
  const curDir = cwd().includes('\\') ? cwd().split('\\') : cwd().split('/'); // arr from path
  const splittedPath = route.includes('\\') ? route.split('\\') : route.split('/'); // arr from path
  const curDirFiltered = curDir.filter((str) => !splittedPath.includes(str) ? true : false);
  const result = path.resolve(curDirFiltered.join('/'), splittedPath.join('/'));
  return result;
}

export function fullKeyListConstructor(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  const commonKeysList = keys1.map((key) => key);
  commonKeysList.push(keys2.map((key) => {
    if (!keys1.includes(key)) {
      return key;
    }
  }).filter((key) => key !== undefined ? true : false));
  return commonKeysList.flat().sort();
}

/*
export function makeArrLookLikeObj(arrOfArrs, repeat) {
  let copy = _.cloneDeep(arrOfArrs);
  copy = copy.map((line) => {
    if (_.isArray(line)) {
      return makeArrLookLikeObj(line);
    }
    return line;
  });
  const gap = '  ';
  const result = `{\n${copy.join('\n')}\n${gap.repeat(repeat)}}\n`;
  return result;
}
*/

export function makeTreeFromArr(arrOfLines, repeat = 1) {
  const gap = '  ';
  let tree = arrOfLines.map(([line, status]) => {
    if (status === 'object') {
      const linesOfObj = line.split('\n');
      return `${gap.repeat(repeat)}${linesOfObj[0]}: ${makeTreeFromArr(linesOfObj[1])}`;
    }
    if (status === 'changed') {
      const linesOfChanged = line.split('\n');
      return `${gap.repeat(repeat)}${linesOfChanged[0]}\n${gap.repeat(repeat)}${linesOfChanged[1]}`;
    }
    if (status === 'deleted' || status === 'added') {
      return `${gap.repeat(repeat)}${line}`;
    }
    return `${gap.repeat(repeat + 1)}${line}`;
  });
  return `{\n${tree.join('\n')}\n}\n`.trim();
}
