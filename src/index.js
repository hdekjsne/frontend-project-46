// import * as fs from 'node:fs';
import { parse } from './parsers.js';
import { fullKeyListConstructor, checkType, rg } from './utils.js';
import { makePlain } from './formatter.js';
import _ from 'lodash';

export function keysWithTags(obj1, obj2) {
  const keys = fullKeyListConstructor(obj1, obj2);
  // структура: [ключ, тег]
  const markedKeys = keys.map((key) => {
    if (Object.hasOwn(obj1, key) && !Object.hasOwn(obj2, key)) {
      return checkType(obj1[key], 'object') ? [key, 'deleted object'] : [key, 'deleted'];
    } else if (!Object.hasOwn(obj1, key) && Object.hasOwn(obj2, key)) {
      return checkType(obj2[key], 'object') ? [key, 'added object'] : [key, 'added'];
    } else if (checkType(obj1[key], 'object') && checkType(obj2[key], 'object')) {
      return [key, 'object'];
    } else if (checkType(obj1[key], 'object') && !checkType(obj2[key], 'object')) {
      return [key, 'object first'];
  } else if (!checkType(obj1[key], 'object') && checkType(obj2[key], 'object')) {
      return [key, 'object second'];
    } else if (!_.isEqual(obj1[key], obj2[key])) {
      return [key, 'changed'];
    }
    return [key, 'not changed'];
  });
  return markedKeys;
}
/*
- deleted object / removed
- deleted / removed
- added object / added
- added / added
- object / rec
- object first / changed 
- object second / changed
- changed / changed
- not changed / -
*/
function makeTree(gap, data1, data2 = data1) {
  const keys = keysWithTags(data1, data2);
  const objectGuts = keys.map(([key, status]) => {
    switch (status) {
      case 'deleted object':
        return `${rg(gap - 1)}- ${key}: ${makeTree(gap + 2, data1[key])}`;
        
      case 'deleted':
        return `${rg(gap - 1)}- ${key}: ${data1[key]}`;
        
      case 'added object':
        return `${rg(gap - 1)}+ ${key}: ${makeTree(gap + 2, data2[key])}`;
        
      case 'added':
        return `${rg(gap - 1)}+ ${key}: ${data2[key]}`;
        
      case 'object':
        return `${rg(gap)}${key}: ${makeTree(gap + 2, data1[key], data2[key])}`;
        
      case 'object first':
        return `${rg(gap - 1)}- ${key}: ${makeTree(gap + 2, data1[key])}\n${rg(gap - 1)}+ ${key}: ${data2[key]}`;
        
      case 'object second':
        return `${rg(gap - 1)}- ${key}: ${data1[key]}\n${rg(gap - 1)}+ ${key}: ${makeTree(gap + 2, data2[key])}`;
        
      case 'changed':
        return `${rg(gap - 1)}- ${key}: ${data1[key]}\n${rg(gap - 1)}+ ${key}: ${data2[key]}`;
        
      default:
        return `${rg(gap)}${key}: ${data1[key]}`;
    }
  });
  return `{\n${objectGuts.join('\n')}\n${rg(gap - 2)}}\n`.trim(); 
}

export default function gendiff(path1, path2, type) {
  const data1 = parse(path1);
  const data2 = parse(path2);
  return type === 'plain' ? makePlain(data1, data2) : makeTree(2, data1, data2);
}
