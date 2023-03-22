// import * as fs from 'node:fs';
import { parse } from './parsers.js';
import { makeStylish, makePlain, makeJson } from './formatter.js';

export default function gendiff(path1, path2, type) {
  const data1 = parse(path1);
  const data2 = parse(path2);
  switch(type) {
    case 'json':
      return JSON.stringify(makeJson(data1, data2), '', 2);
      
    case 'plain':
      return makePlain(data1, data2);
      
    default:
      return makeStylish(2, data1, data2);
  }
}
