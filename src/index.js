// import * as fs from 'node:fs';
import _ from 'lodash';
import { fullKeyListConstructor, makeArrLookLikeObj } from './utils.js';
import { parse } from './parsers.js';

function makeTree(data1, data2, repeat = 2) {
  const keys = fullKeyListConstructor(data1, data2);
  const lines = keys.map((key) => {
    const gap = '  ';
    if (Object.hasOwn(data1, key) && !Object.hasOwn(data2, key)) { // deleted
      return `${gap.repeat(repeat - 1)}- ${key}: ${data1[key]}`;
    } else if (!Object.hasOwn(data1, key) && Object.hasOwn(data2, key)) { // added
      return `${gap.repeat(repeat - 1)}+ ${key}: ${data2[key]}`;
    } else if (data1[key] !== data2[key]) { // changed
      if ((_.isObject(data1[key]) && !_.isArray(data1[key])) && (_.isObject(data2[key]) && !_.isArray(data2[key]))) { // both are objects
        return `${gap.repeat(repeat)}${makeTree(data1[key], data2[key], repeat + 1)}`;
      } else if (_.isArray(data1[key]) || _.isArray(data2[key])) { // there are arrays
        if (_.isEqual(data1[key], data2[key])) {
          return `${gap.repeat(repeat)}${key}: ${data1[key]}`;
        }
        return `${gap.repeat(repeat - 1)}- ${key}: ${data1[key]}\n${gap.repeat(repeat - 1)}+ ${key}: ${data2[key]}`; // !!
      }
      return `${gap.repeat(repeat - 1)}+ ${key}: ${data1[key]}\n${gap.repeat(repeat - 1)}- ${key}: ${data2[key]}`;
    }
    return `${gap.repeat(repeat)}${key}: ${data1[key]}`;
  });
  return makeArrLookLikeObj(lines);
}

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
  return makeTree(data1, data2, 2);
}
