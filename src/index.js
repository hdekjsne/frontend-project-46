// import * as fs from 'node:fs';
import _ from 'lodash';
import { fullKeyListConstructor, makeTreeFromArr } from './utils.js';
import { parse } from './parsers.js';

function keysWithTags(obj1, obj2) {
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
      } else if (_.isObject(obj1[key]) && !_.isObject(obj2[key])) {
        return [key, 'object first', keysWithTags(obj1[key])];
      } else if (!_.isObject(obj1[key]) && _.isObject(obj2[key])) {
        return [key, 'object second', keysWithTags(obj2[key])];
      }
      return [key, 'changed'];
    }
    return [key, 'not changed'];
  });
  return markedKeys;
}

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
- not changed
*/

function makeLines(data1, data2 = data1) {
  // str, status, key, object
  const keys = keysWithTags(data1, data2);
  const lines = keys.map(([key, status]) => {
    switch (status) {
      case 'deleted':
        if (_.isObject(data1[key]) && !_.isArray(data1[key])) {
          return ['', 'deleted object', key, makeLines(data1[key])];
        }
        return [`- ${key}: ${data1[key]}`, status];
        
      case 'added':
        if (_.isObject(data2[key]) && !_.isArray(data2[key])) {
        return ['', 'added object', key, makeLines(data2[key])];
        }
        return [`+ ${key}: ${data2[key]}`, status];
      
      case 'array':
        if (_.isEqual(data1[key], data2[key])) {
          return [`${key}: ${data1[key]}`, 'not changed'];
        }
        return [[`- ${key}: ${data1[key]}`, `+ ${key}: ${data2[key]}`], 'changed'];
        // [str, status, key, object]
      case 'object':
        return ['', status, key, [makeLines(data1[key]), makeLines(data2[key])]];
        
      case 'object first':
        return [`+ ${key}: ${data2[key]}`, status, key, makeLines(data1[key])];
        
      case 'object second':
        return [`- ${key}: ${data1[key]}`, status, key, makeLines(data2[key])];
        
      case 'changed':
        return [[`- ${key}: ${data1[key]}`, `+ ${key}: ${data2[key]}`], 'changed'];
        
      default:
        return [`${key}: ${data1[key]}`, status]; // status === 'not changed'
    }
  });
//  console.log(lines);
//  return makeTreeFromArr(lines, repeat);
  return lines;
//  return {values: lines};
}

export default function gendiff(path1, path2) {
  const data1 = parse(path1);
  const data2 = parse(path2);
  const preResult = makeLines(data1, data2);
  return makeTreeFromArr(preResult);
  // return JSON.stringify(preResult);
}

console.log(gendiff('__fixtures__/file-recursive-1.json', '__fixtures__/file-recursive-2.json'));
