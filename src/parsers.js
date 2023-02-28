import load from 'js-yaml';
import * as fs from 'node:fs';
import { makeAbsolutePath } from './utils.js';

function yamlParser(path) {
  const data = fs.readFileSync(path, 'utf-8');
  const result = yaml.load(data);
  return result;
}

function jsonParser(path) {
  const data = fs.readFileSync(path, 'utf-8');
  const result = JSON.parse(data);
  return result;
}

export function parse(path) {
  const absPath = makeAbsolutePath(path);
  let format = path.split('.');
  format = format[format.length - 1];
  let data;
  switch (format) {
    case 'yml':
      data = yamlParser(absPath);
      break;
    
    default:
      data = jsonParser(absPath);
  }
  return data;
}
