// import * as fs from 'node:fs';
import { parse } from './parsers.js';
import { makeStylish, makePlain } from './formatter.js';

export default function gendiff(path1, path2, type) {
  const data1 = parse(path1);
  const data2 = parse(path2);
  return type === 'plain' ? makePlain(data1, data2) : makeStylish(2, data1, data2);
}
