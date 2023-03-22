import { cwd } from 'node:process';
import path from 'node:path';
import _ from 'lodash';

export function makeAbsolutePath(route) {
  const curDir = cwd().includes('\\') ? cwd().split('\\') : cwd().split('/'); // arr from path
  const splittedPath = route.includes('\\') ? route.split('\\') : route.split('/'); // arr from path
  const curDirFiltered = curDir.filter((str) => !splittedPath.includes(str));
  const result = path.resolve(curDirFiltered.join('/'), splittedPath.join('/'));
  return result;
}

export function fullKeyListConstructor(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  const commonKeys = _.sortBy(_.uniq(keys1.concat(keys2)));
  return commonKeys;
}

export function checkType(value, type) {
  const others = ['undefined', 'boolean', 'string', 'number', 'bigint', 'symbol'];
  if (_.isArray(value) && type === 'array') return true;
  if (type === 'object' && (_.isObject(value) && !_.isArray(value))) return true;
  if (type === 'other' && others.includes(typeof value)) return true;
  return false;
}

export function checkValueType(value) {
  if (typeof value === 'string') return `'${value}'`;
  if (checkType(value, 'object')) return '[complex value]';
  return value;
}

// like 'repeat gap'
export function rg(count) {
  return '  '.repeat(count);
}
