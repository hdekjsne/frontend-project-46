// import * as fs from 'node:fs';
import _ from 'lodash';
import { fullKeyListCostructor, makeArrLookLikeObj } from './utils.js';
import { parse } from './parsers.js';

export default function gendiff(path1, path2) {
  const data1 = parse(path1);
  const data2 = parse(path2);
  const keys = fullKeyListCostructor(data1, data2);
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
  */
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
  const result = makeArrLookLikeObj(resultEntries);
  return result;
}
