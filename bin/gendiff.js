#!/usr/bin/env node

import { program } from 'commander';
import * as fs from 'node:fs';
import _ from 'lodash';

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
  return copy;
}

export default function gendiff(path1, path2) {
  const data1 = fs.readFileSync(path1, 'utf-8');
  const data2 = fs.readFileSync(path2, 'utf-8');
  const parsedData1 = JSON.parse(data1);
  const parsedData2 = JSON.parse(data2);
  const keys = fullKeyListCostructor(parsedData1, parsedData2);
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
  const almostResult = makeArrLookLikeObj(resultEntries);
  const result = `{\n${almostResult}\n}`;
  return result;
}

program
  .version('1.0.0')
  .description('Compares two configuration files and shows a difference.')
  .option('-f, --format <type>', 'output format')

program.parse(process.argv)
