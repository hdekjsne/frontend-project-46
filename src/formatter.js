import { fullKeyListConstructor, rg, checkType, checkValueType } from './utils.js';
import _ from 'lodash';

function keysWithTags(obj1, obj2) {
  const keys = fullKeyListConstructor(obj1, obj2);
  // структура: [ключ, тег]
  const markedKeys = keys.map((key) => {
    if (Object.hasOwn(obj1, key) && !Object.hasOwn(obj2, key)) {
      return checkType(obj1[key], 'object') ? [key, 'deleted object'] : [key, 'deleted'];
    } else if (!Object.hasOwn(obj1, key) && Object.hasOwn(obj2, key)) {
      return checkType(obj2[key], 'object') ? [key, 'added object'] : [key, 'added'];
    } else if (checkType(obj1[key], 'object') && checkType(obj2[key], 'object')) {
      return [key, 'object'];
    } else if (checkType(obj1[key], 'object') && !checkType(obj2[key], 'object')) {
      return [key, 'object first'];
  } else if (!checkType(obj1[key], 'object') && checkType(obj2[key], 'object')) {
      return [key, 'object second'];
    } else if (!_.isEqual(obj1[key], obj2[key])) {
      return [key, 'changed'];
    }
    return [key, 'not changed'];
  });
  return markedKeys;
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

export function makeStylish(gap, data1, data2 = data1) {
  const keys = keysWithTags(data1, data2);
  const objectGuts = keys.map(([key, status]) => {
    switch (status) {
      case 'deleted object':
        return `${rg(gap - 1)}- ${key}: ${makeStylish(gap + 2, data1[key])}`;
        
      case 'deleted':
        return `${rg(gap - 1)}- ${key}: ${data1[key]}`;
        
      case 'added object':
        return `${rg(gap - 1)}+ ${key}: ${makeStylish(gap + 2, data2[key])}`;
        
      case 'added':
        return `${rg(gap - 1)}+ ${key}: ${data2[key]}`;
        
      case 'object':
        return `${rg(gap)}${key}: ${makeStylish(gap + 2, data1[key], data2[key])}`;
        
      case 'object first':
        return `${rg(gap - 1)}- ${key}: ${makeStylish(gap + 2, data1[key])}\n${rg(gap - 1)}+ ${key}: ${data2[key]}`;
        
      case 'object second':
        return `${rg(gap - 1)}- ${key}: ${data1[key]}\n${rg(gap - 1)}+ ${key}: ${makeStylish(gap + 2, data2[key])}`;
        
      case 'changed':
        return `${rg(gap - 1)}- ${key}: ${data1[key]}\n${rg(gap - 1)}+ ${key}: ${data2[key]}`;
        
      default:
        return `${rg(gap)}${key}: ${data1[key]}`;
    }
  });
  return `{\n${objectGuts.join('\n')}\n${rg(gap - 2)}}\n`.trim(); 
}

export function makePlain(obj1, obj2, path = '') {
  const keys = keysWithTags(obj1, obj2);
  const lines = keys.map(([key, status]) => {
    let intro = [path, key].join('.');
    if (intro.startsWith('.')) intro = intro.slice(1);
    if (status === 'deleted object' || status === 'deleted') {
      return `Property '${intro}' was removed\n`;
    } else if (status === 'added object' || status === 'added') {
      return `Property '${intro}' was added with value: ${checkValueType(obj2[key])}\n`;
    } else if (status === 'object first' || status === 'object second' || status === 'changed') {
      return `Property '${intro}' was updated. From ${checkValueType(obj1[key])} to ${checkValueType(obj2[key])}\n`;
    } else if (status === 'object') {
      return makePlain(obj1[key], obj2[key], intro) + '\n';
    }
  }).filter((line) => line !== undefined ? true : false);
  return lines.join('').trim();
}

export class Value {
  constructor(key, type, value1, value2) {
    this.key = key;
    this.type = type;
    this.value1 = value1;
    this.value2 = value2;
  }
}

export function makeJson(obj1, obj2) {
  const keys = keysWithTags(obj1, obj2);
  const result = keys.reduce((acc, [key, status]) => {
    if (status.startsWith('deleted')) {
      acc[key] = new Value(key, 'removed', _.cloneDeep(obj1[key]), undefined);
    } else if (status.startsWith('added')) {
      acc[key] = new Value(key, 'added', undefined, _.cloneDeep(obj2[key]));
    } else if (status === 'object') {
      acc[key] = new Value(key, 'nested', makeJson(obj1[key], obj2[key]));
    } else if (status.startsWith('object') || status === 'changed') {
      acc[key] = new Value(key, 'changed', _.cloneDeep(obj1[key]), _.cloneDeep(obj2[key]));
    } else if (status === 'not changed') {
      acc[key] = new Value(key, status, _.cloneDeep(obj1[key]), _.cloneDeep(obj2[key]));
    }
    return acc;
  }, {});
  return result;
}
