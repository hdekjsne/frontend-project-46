// import * as fs from 'node:fs';
import parse from './parsers.js';
import { stylish, plain, json } from './formatter.js';

export default function gendiff(path1, path2, type) {
  const data1 = parse(path1);
  const data2 = parse(path2);
  switch (type) {
    case 'json':
      return JSON.stringify(json(data1, data2), '', 2);
    case 'plain':
      return plain(data1, data2);
    default:
      return stylish(2, data1, data2);
  }
}
