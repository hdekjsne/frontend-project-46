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
  /*
  let tree = arrOfLines.map(([line, status]) => {
    if (status === 'object') {
      // const linesOfObj = line.split('\n');
      // return `${gap.repeat(repeat)}${linesOfObj[0]}: ${makeTreeFromArr(linesOfObj[1])}`;
      return `${gap.repeat(repeat)}${line[0]}: ${makeTreeFromArr(line[1], repeat + 2)}`;
    }
    if (status === 'changed') {
      const linesOfChanged = line.split('\n');
      return `${gap.repeat(repeat)}${linesOfChanged[0]}\n${gap.repeat(repeat)}${linesOfChanged[1]}`; // !!
    }
    if (status === 'deleted' || status === 'added') {
      return `${gap.repeat(repeat)}${line}`; // !!
    }
    if (status === 'deleted object') {
      const [key, values] = line;
      return `- ${key}: ${makeTreeFromArr(values)}`;
    }
    if (status === 'added object') {
      const [key, values] = line;
      return `+ ${key}: ${makeTreeFromArr(values)}`;
    }
    if (status === 'changed first object') {
      const [oldObj, newPrimitive] = line;
      const [key, values] = oldObj;
      return `${gap.repeat(repeat)}- ${key}: ${makeTreeFromArr(values)}\n${gap.repeat(repeat)}+ ${newPrimitive}`
    }
    if (status === 'changed second object') {
      const [newObj, oldPrimitive] = line;
      const [key, values] = newObj;
      return `${gap.repeat(repeat)}- ${oldPrimitive}\n${gap.repeat(repeat)}+ ${key}: ${makeTreeFromArr(values)}`;
    }
    return `${gap.repeat(repeat)}${line}`;
  });
  */
  const tree = arrOfLines.map(([line, status, obj1, obj2]), () => {
    // [str, status, key, obj]
    switch (status) {
      case 'deleted':
      return `${gap.repeat(repeat - 1)}${line}`;
    }
  });
  return `{\n${tree.join('\n')}\n${gap}.repeat(repeat - 1)}}\n`.trim();
}
