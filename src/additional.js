import * as fs from 'node:fs';
import { cwd } from 'node:process';
import _ from 'lodash';

export function makeAbsolutePath(path) {
  const curDir = cwd().includes('\\') ? cwd().split('\\') : cwd().split('/'); // arr from path
  const splittedPath = path.icludes('\\') ? path.split('\\') : path.split('/'); // arr from path
  const curDirFiltered = curDir.filter((str) => !splittedPath.includes(str) ? true : false);
  const result = path.resolve(curDirFiltered.join('/'), splittedPath.join('/'));
  return result;
}

export function fullKeyListCostructor(obj1, obj2) {
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

export function makeArrLookLikeObj(arrOfArrs) {
  let copy = _.cloneDeep(arrOfArrs);
  copy = copy.map((entrie) => entrie.join(': '));
  copy = copy.join('\n');
  const result = `{\n${copy}\n}`;
  return result;
}

console.log(cwd());
