import _ from 'lodash';
/* eslint-disable-next-line */
import { fullKeyListConstructor, rg, checkType, checkVT } from './utils.js';

export function keysWithTags(obj1, obj2) {
  const keys = fullKeyListConstructor(obj1, obj2);
  const objects = keys.filter((k) => checkType(obj1[k], 'object') || checkType(obj2[k], 'object'));
  const others = keys.filter((k) => !checkType(obj1[k], 'object') && !checkType(obj2[k], 'object'));
  const taggedObjects = objects.map((k) => {
    if (!Object.hasOwn(obj2, k)) return [k, 'deleted object'];
    if (!Object.hasOwn(obj1, k)) return [k, 'added object'];
    if (!checkType(obj2[k], 'object')) return [k, 'object first'];
    if (!checkType(obj1[k], 'object')) return [k, 'object second'];
    return [k, 'object'];
  });
  const taggedOthers = others.map((k) => {
    if (!Object.hasOwn(obj2, k)) return [k, 'deleted'];
    if (!Object.hasOwn(obj1, k)) return [k, 'added'];
    if (!_.isEqual(obj1[k], obj2[k])) return [k, 'changed'];
    return [k, 'not changed'];
  });
  const common = taggedObjects.concat(taggedOthers);
  const sorted = _.sortBy(common, (arr) => arr[0]);
  return sorted;
}

/*
- deleted object
- deleted
- added object
- added
- object
- object first
- object second
- changed
- not changed
*/

export function stylish(g, data1, data2 = data1) {
  const keys = keysWithTags(data1, data2);
  const objectGuts = keys.map(([k, status]) => {
    switch (status) {
      case 'deleted object':
        return `${rg(g - 1)}- ${k}: ${stylish(g + 2, data1[k])}`;
      case 'deleted':
        return `${rg(g - 1)}- ${k}: ${data1[k]}`;
      case 'added object':
        return `${rg(g - 1)}+ ${k}: ${stylish(g + 2, data2[k])}`;
      case 'added':
        return `${rg(g - 1)}+ ${k}: ${data2[k]}`;
      case 'object':
        return `${rg(g)}${k}: ${stylish(g + 2, data1[k], data2[k])}`;
      case 'object first':
        return `${rg(g - 1)}- ${k}: ${stylish(g + 2, data1[k])}\n${rg(g - 1)}+ ${k}: ${data2[k]}`;
      case 'object second':
        return `${rg(g - 1)}- ${k}: ${data1[k]}\n${rg(g - 1)}+ ${k}: ${stylish(g + 2, data2[k])}`;
      case 'changed':
        return `${rg(g - 1)}- ${k}: ${data1[k]}\n${rg(g - 1)}+ ${k}: ${data2[k]}`;
      default:
        return `${rg(g)}${k}: ${data1[k]}`;
    }
  });
  return `{\n${objectGuts.join('\n')}\n${rg(g - 2)}}\n`.trim();
}

export function plain(obj1, obj2, path = '') {
  const keys = keysWithTags(obj1, obj2);
  const lines = keys.map(([k, status]) => {
    const intro = ([path, k].join('.').startsWith('.')) ? [path, k].join('.').slice(1) : [path, k].join('.');
    switch (status) {
      case 'deleted object':
      case 'deleted':
        return `Property '${intro}' was removed\n`;
      case 'added object':
      case 'added':
        return `Property '${intro}' was added with value: ${checkVT(obj2[k])}\n`;
      case 'object first':
      case 'object second':
      case 'changed':
        return `Property '${intro}' was updated. From ${checkVT(obj1[k])} to ${checkVT(obj2[k])}\n`;
      case 'object':
        return `${plain(obj1[k], obj2[k], intro)}\n`;
      default:
        return undefined;
    }
  }).filter((line) => line !== undefined);
  return lines.join('').trim();
}

export function makeObj(bigK, key, type, value1, value2) {
  return {
    [bigK]: {
      key,
      type,
      value1,
      value2,
    },
  };
}

export function json(obj1, obj2) {
  const keys = keysWithTags(obj1, obj2);
  const result = keys.reduce((acc, [k, status]) => {
    switch (status) {
      case 'deleted object':
      case 'deleted':
        return { ...acc, ...makeObj(k, k, 'removed', _.cloneDeep(obj1[k]), undefined) };
      case 'added object':
      case 'added':
        return { ...acc, ...makeObj(k, k, 'added', undefined, _.cloneDeep(obj2[k])) };
      case 'object':
        return { ...acc, ...makeObj(k, k, 'nested', json(obj1[k], obj2[k])) };
      case 'object first':
      case 'object second':
      case 'changed':
        return { ...acc, ...makeObj(k, k, 'changed', _.cloneDeep(obj1[k]), _.cloneDeep(obj2[k])) };
      default:
        return {
          ...acc,
          ...makeObj(k, k, status, _.cloneDeep(obj1[k]), _.cloneDeep(obj2[k])),
        };
    }
  }, {});
  return result;
}
