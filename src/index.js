import * as fs from 'node:fs';
import _ from 'lodash';
import { makeAbsolutePath, fullKeyListCostructor, makeArrLookLikeObj } from './additional.js';

export default function gendiff(path1, path2) {
  const absPath1 = makeAbsolutePath(path1);
  const absPath2 = makeAbsolutePath(path2);
  const data1 = fs.readFileSync(absPath1, 'utf-8');
  const data2 = fs.readFileSync(absPath2, 'utf-8');
  const parsedData1 = JSON.parse(data1);
  const parsedData2 = JSON.parse(data2);
  const keys = fullKeyListCostructor(parsedData1, parsedData2);
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
    if (!Object.hasOwn(parsedData1, key)) {
      const strKey = `  + ${key}`;
      resultEntries.push([strKey, parsedData2[key]]);
    } else if (!Object.hasOwn(parsedData2, key)) {
      const strKey = `  - ${key}`;
      resultEntries.push([strKey, parsedData1[key]]);
    } else if (!_.isEqual(parsedData1[key], parsedData2[key])) {
      const strKey1 = `  - ${key}`;
      const strKey2 = `  + ${key}`;
      resultEntries.push([strKey1, parsedData1[key]]);
      resultEntries.push([strKey2, parsedData2[key]]);
    } else {
      const strKey = `    ${key}`
      resultEntries.push([strKey, parsedData1[key]]);
    }
  }
  const result = makeArrLookLikeObj(resultEntries);
  return result;
}
