import _ from 'lodash';
/* eslint-disable-next-line */
import { fullKeyListConstructor, rg, checkType, checkValueType } from './utils.js';

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
    if (status === 'deleted object') return `${rg(gap - 1)}- ${key}: ${makeStylish(gap + 2, data1[key])}`;
    if (status === 'deleted') return `${rg(gap - 1)}- ${key}: ${data1[key]}`;
    if (status === 'added object') return `${rg(gap - 1)}+ ${key}: ${makeStylish(gap + 2, data2[key])}`;
    if (status === 'added') return `${rg(gap - 1)}+ ${key}: ${data2[key]}`;
    if (status === 'object') return `${rg(gap)}${key}: ${makeStylish(gap + 2, data1[key], data2[key])}`;
    if (status === 'object first') {
      return `${rg(gap - 1)}- ${key}: ${makeStylish(gap + 2, data1[key])}\n${rg(gap - 1)}+ ${key}: ${data2[key]}`;
    }
    if (status === 'object second') {
      return `${rg(gap - 1)}- ${key}: ${data1[key]}\n${rg(gap - 1)}+ ${key}: ${makeStylish(gap + 2, data2[key])}`;
    }
    if (status === 'changed') return `${rg(gap - 1)}- ${key}: ${data1[key]}\n${rg(gap - 1)}+ ${key}: ${data2[key]}`;
    if (status === 'not changed') return `${rg(gap)}${key}: ${data1[key]}`;
  });
  return `{\n${objectGuts.join('\n')}\n${rg(gap - 2)}}\n`.trim();
}

export function makePlain(obj1, obj2, path = '') {
  const keys = keysWithTags(obj1, obj2);
  const lines = keys.map(([key, status]) => {
    const intro = ([path, key].join('.').startsWith('.')) ? [path, key].join('.').slice(1) : [path, key].join('.');
    if (status.startsWith('deleted')) return `Property '${intro}' was removed\n`;
    if (status.startsWith('added')) return `Property '${intro}' was added with value: ${checkValueType(obj2[key])}\n`;
    if (status === 'object first' || status === 'object second' || status === 'changed') {
      return `Property '${intro}' was updated. From ${checkValueType(obj1[key])} to ${checkValueType(obj2[key])}\n`;
    }
    if (status === 'object') return `${makePlain(obj1[key], obj2[key], intro)}\n`;
  }).filter((line) => line !== undefined);
  return lines.join('').trim();
}
/*
export function makeObj(key, type, value1, value2) {
  return {
    key,
    type,
    value1,
    value2,
  };
}
*/
export function makeObj(bigK, key, type, value1, value2) {
  const result = {};
  result[bigK] = {
    key,
    type,
    value1,
    value2,
  }
  return result;
}

export function makeJson(obj1, obj2) {
  const keys = keysWithTags(obj1, obj2);
  const result = keys.reduce((acc, [key, status]) => {
    if (status.startsWith('deleted')) {
      Object.assign(acc, makeObj(key, key, 'removed', _.cloneDeep(obj1[key]), undefined));
    }
    if (status.startsWith('added')) {
      Object.assign(acc, makeObj(key, key, 'added', undefined, _.cloneDeep(obj2[key])));
    }
    if (status === 'object') {
      Object.assign(acc, makeObj(key, key, 'nested', makeJson(obj1[key], obj2[key])));
    }
    if (status === 'object first' || status === 'object second' || status === 'changed') {
      Object.assign(acc, makeObj(key, key, 'changed', _.cloneDeep(obj1[key]), _.cloneDeep(obj2[key])));
    }
    if (status === 'not changed') {
      Object.assign(acc, makeObj(key, key, status, _.cloneDeep(obj1[key]), _.cloneDeep(obj2[key])));
    }
    return acc;
  }, {});
  return result;
}
