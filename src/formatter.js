import { fullKeyListConstructor, rg, checkType, checkValueType } from './utils.js';
import _ from 'lodash';

function keysWithTags(obj1, obj2) {
  const keys = fullKeyListConstructor(obj1, obj2);
  // структура: [ключ, тег]
  const markedKeys = keys.map((key) => {
    let tag;
    if (!_.isEqual(obj1[key], obj2[key])) tag = [key, 'changed'];
    if (_.isEqual(obj1[key], obj2[key])) tag = [key, 'not changed'];
    if (checkType(obj1[key], 'object') && checkType(obj2[key], 'object')) tag = [key, 'object'];
    if (checkType(obj1[key], 'object') && !checkType(obj2[key], 'object')) tag = [key, 'object first'];
    if (!checkType(obj1[key], 'object') && checkType(obj2[key], 'object')) tag = [key, 'object second'];
    if (Object.hasOwn(obj1, key) && !Object.hasOwn(obj2, key)) {
      tag = checkType(obj1[key], 'object') ? [key, 'deleted object'] : [key, 'deleted'];
    } 
    if (!Object.hasOwn(obj1, key) && Object.hasOwn(obj2, key)) {
      tag = checkType(obj2[key], 'object') ? [key, 'added object'] : [key, 'added'];
    } 
    return tag;
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
    let line;
    if (status === 'deleted object') line = `${rg(gap - 1)}- ${key}: ${makeStylish(gap + 2, data1[key])}`;
    if (status === 'deleted') line = `${rg(gap - 1)}- ${key}: ${data1[key]}`;
    if (status === 'added object') line = `${rg(gap - 1)}+ ${key}: ${makeStylish(gap + 2, data2[key])}`;
    if (status === 'added') line = `${rg(gap - 1)}+ ${key}: ${data2[key]}`;
    if (status === 'object') line = `${rg(gap)}${key}: ${makeStylish(gap + 2, data1[key], data2[key])}`;
    if (status === 'object first') {
      line = `${rg(gap - 1)}- ${key}: ${makeStylish(gap + 2, data1[key])}\n${rg(gap - 1)}+ ${key}: ${data2[key]}`;
    }
    if (status === 'object second') {
      line = `${rg(gap - 1)}- ${key}: ${data1[key]}\n${rg(gap - 1)}+ ${key}: ${makeStylish(gap + 2, data2[key])}`;
    }
    if (status === 'changed') line = `${rg(gap - 1)}- ${key}: ${data1[key]}\n${rg(gap - 1)}+ ${key}: ${data2[key]}`;
    if (status === 'not changed') line = `${rg(gap)}${key}: ${data1[key]}`;
    /*
    switch (status) {
      case 'deleted object':
        line = `${rg(gap - 1)}- ${key}: ${makeStylish(gap + 2, data1[key])}`;
        break;
        
      case 'deleted':
        line = `${rg(gap - 1)}- ${key}: ${data1[key]}`;
        break;
        
      case 'added object':
        line = `${rg(gap - 1)}+ ${key}: ${makeStylish(gap + 2, data2[key])}`;
        break;
        
      case 'added':
        line = `${rg(gap - 1)}+ ${key}: ${data2[key]}`;
        break;
        
      case 'object':
        line = `${rg(gap)}${key}: ${makeStylish(gap + 2, data1[key], data2[key])}`;
        break;
        
      case 'object first':
        line = `${rg(gap - 1)}- ${key}: ${makeStylish(gap + 2, data1[key])}\n${rg(gap - 1)}+ ${key}: ${data2[key]}`;
        break;
        
      case 'object second':
        line = `${rg(gap - 1)}- ${key}: ${data1[key]}\n${rg(gap - 1)}+ ${key}: ${makeStylish(gap + 2, data2[key])}`;
        break;
        
      case 'changed':
        line = `${rg(gap - 1)}- ${key}: ${data1[key]}\n${rg(gap - 1)}+ ${key}: ${data2[key]}`;
        break;
        
      default:
        return `${rg(gap)}${key}: ${data1[key]}`;
    }
    */
    return line;
  });
  return `{\n${objectGuts.join('\n')}\n${rg(gap - 2)}}\n`.trim(); 
}

export function makePlain(obj1, obj2, path = '') {
  const keys = keysWithTags(obj1, obj2);
  const lines = keys.map(([key, status]) => {
    let intro = [path, key].join('.');
    if (intro.startsWith('.')) intro = intro.slice(1);
    let line;
    
    if (status.startsWith('deleted')) line = `Property '${intro}' was removed\n`;
    if (status.startsWith('added')) line = `Property '${intro}' was added with value: ${checkValueType(obj2[key])}\n`;
    if (status === 'object first' || status === 'object second' || status === 'changed') {
      line = `Property '${intro}' was updated. From ${checkValueType(obj1[key])} to ${checkValueType(obj2[key])}\n`;
    } 
    if (status === 'object') line = makePlain(obj1[key], obj2[key], intro) + '\n';
    return line
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
    if (status.startsWith('deleted')) acc[key] = new Value(key, 'removed', _.cloneDeep(obj1[key]), undefined);
    if (status.startsWith('added')) acc[key] = new Value(key, 'added', undefined, _.cloneDeep(obj2[key]));
    if (status === 'object') acc[key] = new Value(key, 'nested', makeJson(obj1[key], obj2[key]));
    if (status === 'object first'|| status === 'object second' || status === 'changed') {
      acc[key] = new Value(key, 'changed', _.cloneDeep(obj1[key]), _.cloneDeep(obj2[key]));
    } 
    if (status === 'not changed') acc[key] = new Value(key, status, _.cloneDeep(obj1[key]), _.cloneDeep(obj2[key]));
    return acc;
  }, {});
  return result;
}
