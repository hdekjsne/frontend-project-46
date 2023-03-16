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

/*
- deleted
- deleted object *
- added
- added object *
- array / both
- object / both
- object first
- object second
- changed
- not changed or default
*/

export function makeTreeFromArr(arrOfLines, repeat = 1) {
  const gap = '  ';
  const tree = arrOfLines.map((arr), () => {
    const [line, status, key, obj] = arr;
    switch(status) {
      case 'deleted':
        return `${gap.repeat(repeat)}${line}`;
        
      case 'deleted object':
        return `${gap.repeat(repeat - 1)}- ${key}: ${makeTreeFromArr(obj)}`;
      
      case 'added':
        return `${gap.repeat(repeat)}${line}`;
        
      case 'added object':
        return `${gap.repeat(repeat - 1)}+ ${key}: ${makeTreeFromArr(obj)}`;
        
      case 'array':
        return `${gap.repeat(repeat - 1)}${line[0]}\n${gap.repeat(repeat - 1)}${line[1]}`;
        
      case 'object':
        return `${gap.repeat(repeat - 1)}- ${key}: ${makeTreeFromArr(obj[0], repeat + 1)}\n${gap.repeat(repeat - 1)}+ ${key}: ${makeTreeFromArr(obj[1], repeat + 1)}`;
        
      case 'object first':
        return `${gap.repeat(repeat - 1)}- ${key}: ${makeTreeFromArr(obj, repeat + 1)}\n${gap.repeat(repeat - 1)}${line}`;
        
      case 'object second':
        return `${gap.repeat(repeat - 1)}${line}\n${gap.repeat(repeat - 1)}+ ${key}: ${makeTreeFromArr(obj, repeat + 1)}`;
        
      case 'changed':
        return `${gap.repeat(repeat - 1)}${line[0]}\n${gap.repeat(repeat - 1)}${line[1]}`;
        
      default:
        return `${gap.repeat(repeat)}${line}`;
    }
  });
  return `{\n${tree.join('\n')}\n${gap}.repeat(repeat - 1)}}\n`.trim();
}
