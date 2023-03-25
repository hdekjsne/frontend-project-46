import _ from 'lodash';
/* eslint-disable-next-line */
import { fullKeyListConstructor, rg, checkType, checkValueType } from './utils.js';

export function keysWithTags(obj1, obj2) {
  const keys = fullKeyListConstructor(obj1, obj2);
  const objects = keys.filter((key) => checkType(obj1[key], 'object') || checkType(obj2[key], 'object'));
  const others = keys.filter((key) => !checkType(obj1[key], 'object') && !checkType(obj2[key], 'object'));
  const taggedObjects = objects.map((key) => {
    if (!Object.hasOwn(obj2, key)) return [key, 'deleted object'];
    if (!Object.hasOwn(obj1, key)) return [key, 'added object'];
    if (!checkType(obj2[key], 'object')) return [key, 'object first'];
    if (!checkType(obj1[key], 'object')) return [key, 'object second'];
    return [key, 'object'];
  });
  const taggedOthers = others.map((key) => {
    if (!Object.hasOwn(obj2, key)) return [key, 'deleted'];
    if (!Object.hasOwn(obj1, key)) return [key, 'added'];
    if (!_.isEqual(obj1[key], obj2[key])) return [key, 'changed'];
    return [key, 'not changed'];
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
  const objectGuts = keys.map(([key, status]) => {
    switch (status) {
      case 'deleted object':
        return `${rg(g - 1)}- ${key}: ${stylish(g + 2, data1[key])}`;
      case 'deleted':
        return `${rg(g - 1)}- ${key}: ${data1[key]}`;
      case 'added object':
        return `${rg(g - 1)}+ ${key}: ${stylish(g + 2, data2[key])}`;
      case 'added':
        return `${rg(g - 1)}+ ${key}: ${data2[key]}`;
      case 'object':
        return `${rg(g)}${key}: ${stylish(g + 2, data1[key], data2[key])}`;
      case 'object first':
        return `${rg(g - 1)}- ${key}: ${stylish(g + 2, data1[key])}\n${rg(g - 1)}+ ${key}: ${data2[key]}`;
      case 'object second':
        return `${rg(g - 1)}- ${key}: ${data1[key]}\n${rg(g - 1)}+ ${key}: ${stylish(g + 2, data2[key])}`;
      case 'changed':
        return `${rg(g - 1)}- ${key}: ${data1[key]}\n${rg(g - 1)}+ ${key}: ${data2[key]}`;
      default:
        return `${rg(g)}${key}: ${data1[key]}`;
    }
  });
  return `{\n${objectGuts.join('\n')}\n${rg(g - 2)}}\n`.trim();
}

export function plain(obj1, obj2, path = '') {
  const keys = keysWithTags(obj1, obj2);
  const lines = keys.map(([key, status]) => {
    const intro = ([path, key].join('.').startsWith('.')) ? [path, key].join('.').slice(1) : [path, key].join('.');
    if (status.startsWith('deleted')) {
      return `Property '${intro}' was removed\n`;
    } else if (status.startsWith('added')) {
      return `Property '${intro}' was added with value: ${checkValueType(obj2[key])}\n`;
    } else if (status === 'object first' || status === 'object second' || status === 'changed') {
      return `Property '${intro}' was updated. From ${checkValueType(obj1[key])} to ${checkValueType(obj2[key])}\n`;
    } else if (status === 'object') {
      return `${plain(obj1[key], obj2[key], intro)}\n`;
    }
    return undefined;
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
  const result = keys.reduce((acc, [key, status]) => {
    if (status.startsWith('deleted')) {
      return { ...acc, ...makeObj(key, key, 'removed', _.cloneDeep(obj1[key]), undefined) };
    } else if (status.startsWith('added')) {
      return { ...acc, ...makeObj(key, key, 'added', undefined, _.cloneDeep(obj2[key])) };
    } else if (status === 'object') {
      return { ...acc, ...makeObj(key, key, 'nested', json(obj1[key], obj2[key])) };
    } else if (status === 'object first' || status === 'object second' || status === 'changed') {
      return { ...acc, ...makeObj(key, key, 'changed', _.cloneDeep(obj1[key]), _.cloneDeep(obj2[key])) };
    }
    return {
      ...acc,
      ...makeObj(key, key, status, _.cloneDeep(obj1[key]), _.cloneDeep(obj2[key])),
    };
  }, {});
  return result;
}
