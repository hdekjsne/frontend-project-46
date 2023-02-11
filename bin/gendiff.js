#!/usr/bin/env node

import { program } from 'commander';
import * as fs from 'node:fs';

export function fullKeyListCostructor(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  const commonKeysList = keys1.map((key) => key);
  commonKeysList.push(keys2.map((key) => {
    if (!keys1.includes(key)) {
      return key;
    }
  }).filter((key) => key !== undefined ? true : false));
  return commonKeysList.flat();
}

function gendiff(path1, path2) {
  const data1 = fs.readFileSync(path1, 'utf-8'); // string
  const data2 = fs.readFileSync(path2, 'utf-8');
  const parsedData1 = JSON.parse(data1); // object
  const parsedData2 = JSON.parse(data2);
}
program
  .version('1.0.0')
  .description('Compares two configuration files and shows a difference.')
  .option('-f, --format <type>', 'output format')

program.parse(process.argv)
