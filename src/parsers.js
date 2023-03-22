import yaml from 'js-yaml';
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

export default function parse(path) {
  const absPath = makeAbsolutePath(path);
  const formats = path.split('.');
  const format = formats[formats.length - 1];
  switch (format) {
    case 'yml':
      return yamlParser(absPath);
    case 'yaml':
      return yamlParser(absPath);
    default:
      return jsonParser(absPath);
  }
}
