// import * as fs from 'node:fs';
import _ from 'lodash';
import { fullKeyListConstructor, makeTreeFromArr } from './utils.js';
import { parse } from './parsers.js';

function keysWithKeys(obj1, obj2) {
  const keys = fullKeyListConstructor(obj1, obj2);
  const markedKeys = keys.map((key) => {
    if (Object.hasOwn(obj1, key) && !Object.hasOwn(obj2, key)) {
      return [key, 'deleted'];
    } else if (!Object.hasOwn(obj1, key) && Object.hasOwn(obj2, key)) {
      return [key, 'added'];
    } else if (obj1[key] !== obj2[key]) {
      if (_.isArray(obj1[key]) && _.isArray(obj2[key])) {
        return [key, 'array'];
      } else if (_.isObject(obj1[key]) && _.isObject(obj2[key])) {
        return [key, 'object'];
      }
      return [key, 'changed'];
    }
    return [key, 'not changed'];
  });
  return markedKeys;
}

/*
- deleted
- added
- array / both
- object / both
- changed
- not changed
*/

function makeTree(data1, data2, repeat) {
  const keys = keysWithKeys(data1, data2);
  const lines = keys.map(([key, status]) => {
    switch (status) {
      case 'deleted':
        return [`- ${key}: ${data1[key]}`, status];
        
      case 'added':
        return [`+ ${key}: ${data2[key]}\n`, status];
      
      case 'array':
        if (_.isEqual(data1[key], data2[key])) {
          return [`${key}: ${data1[key]}\n`, 'not changed'];
        }
        return [`- ${key}: ${data1[key]}\n+ ${key}: ${data2[key]}\n`, 'changed'];
        
      case 'object':
        return [[`${key}`, [makeTree(data1[key], data2[key])]], status];
        
      case 'changed':
        return [`- ${key}: ${data1[key]}\n+ ${key}: ${data2[key]}\n`, status];
        
      default:
        return [`${key}: ${data1[key]}\n`, status];
    }
  });
  console.log(lines);
  return makeTreeFromArr(lines, repeat);
}

// ^ experimenting
/*
function makeTree(data1, data2, repeat = 1) {
  const keys = fullKeyListConstructor(data1, data2);
  const lines = keys.map((key) => {
    const gap = '  ';
    if (Object.hasOwn(data1, key) && !Object.hasOwn(data2, key)) { // deleted
    return `${gap.repeat(repeat)}- ${key}: ${data1[key]}`;
    } else if (!Object.hasOwn(data1, key) && Object.hasOwn(data2, key)) { // added
      return `${gap.repeat(repeat)}+ ${key}: ${data2[key]}`;
    } else if (data1[key] !== data2[key]) { // changed
      if ((_.isObject(data1[key]) && !_.isArray(data1[key])) && (_.isObject(data2[key]) && !_.isArray(data2[key]))) { // both are objects
        const value1 = _.cloneDeep(data1[key]);
        const value2 = _.cloneDeep(data2[key]);
        return `${gap.repeat(repeat)}${key}: ${makeTree(value1, value2, repeat + 1)}`; // !!
      } else if (_.isArray(data1[key]) || _.isArray(data2[key])) { // there are arrays
        if (_.isEqual(data1[key], data2[key])) {
          return `${gap.repeat(repeat)}${key}: ${data1[key]}`;
        }
        return `${gap.repeat(repeat)}- ${key}: ${data1[key]}\n${gap.repeat(repeat)}+ ${key}: ${data2[key]}`; // !!
      }
      return `${gap.repeat(repeat)}- ${key}: ${data1[key]}\n${gap.repeat(repeat)}+ ${key}: ${data2[key]}`;
    }
    return `${gap.repeat(repeat + 1)}${key}: ${data1[key]}`;
  });
  return makeArrLookLikeObj(lines, repeat).trim();
}
*/

export default function gendiff(path1, path2) {
  const data1 = parse(path1);
  const data2 = parse(path2);
  /*
  const resultEntries = keys.map((key) => {
    if (!Object.hasOwn(parsedData1, key)) {
      const strKey = `  + ${key}`;
      return [strKey, parsedData2[key]];
    } else if (!Object.hasOwn(parsedData2, key)) {
      const strKey = `  - ${key}`;
      return [strKey, parsedData1[key]];
    } else if (!_.isEqual(parsedData1[key], parsedData2[key])) {
      const strKey1 = `  - ${key}`;
      const strKey2 = `  + ${key}`;
      return [strKey1, parsedData1[key]], [strKey2, parsedData2[key]]; // trouble here
    } else {
      const strKey = `    ${key}`
      return [strKey, parsedData1[key]];
    }
  });
  const resultEntries = [];
  for (const key of keys) {
    if (!Object.hasOwn(data1, key)) {
      const strKey = `  + ${key}`;
      resultEntries.push([strKey, data2[key]]);
    } else if (!Object.hasOwn(data2, key)) {
      const strKey = `  - ${key}`;
      resultEntries.push([strKey, data1[key]]);
    } else if (!_.isEqual(data1[key], data2[key])) {
      const strKey1 = `  - ${key}`;
      const strKey2 = `  + ${key}`;
      resultEntries.push([strKey1, data1[key]]);
      resultEntries.push([strKey2, data2[key]]);
    } else {
      const strKey = `    ${key}`
      resultEntries.push([strKey, data1[key]]);
    }
  }
  */
  return makeTree(data1, data2, 1);
}

console.log(gendiff('__fixtures__/file-recursive-1.json', '__fixtures__/file-recursive-2.json'));
