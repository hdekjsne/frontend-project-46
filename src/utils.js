import { cwd } from 'node:process';
import path from 'node:path';
import _ from 'lodash';

// функция ниже используется в src/parsers.js
export function makeAbsolutePath(route) {
  const curDir = cwd().includes('\\') ? cwd().split('\\') : cwd().split('/'); // arr from path
  const splittedPath = route.includes('\\') ? route.split('\\') : route.split('/'); // arr from path
  const curDirFiltered = curDir.filter((str) => !splittedPath.includes(str) ? true : false);
  const result = path.resolve(curDirFiltered.join('/'), splittedPath.join('/'));
  return result;
}

export function fullKeyListConstructor(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  // мап вытаскивает все оригинальные ключи из обоих объектов
  const commonKeysList = keys1.map((key) => key);
  commonKeysList.push(keys2.map((key) => {
    if (!keys1.includes(key)) {
      return key;
    }
  }).filter((key) => key !== undefined ? true : false));
  // сортирует в алфавитном порядке
  return commonKeysList.flat().sort();
}

export function checkType(value, type) {
  const others = ['undefined', 'boolean', 'string', 'number', 'bigint', 'symbol'];
  if (_.isArray(value) && type === 'array') {
    return true
  } else if (type === 'object' && (_.isObject(value) && !_.isArray(value))) {
    return true;
  } else if (type === 'other' && others.includes(typeof value)) {
    return true;
  }
  return false;
}

/*
Список всех тэгов:
- deleted
- deleted object *
- added
- added object *
- array / both
- object / both
- object first
- object second
- changed
- not changed object
- not changed or default
*/

export function keysWithTags(obj1, obj2) {
  // то, что ниже: src/utils.js
  const keys = fullKeyListConstructor(obj1, obj2);
  // ниже первое присвоение тегов
  // структура: [ключ, тег]
  const markedKeys = keys.map((key) => {
    if (Object.hasOwn(obj1, key) && !Object.hasOwn(obj2, key)) {
      if (checkType(obj1[key], 'object')) {
        return [key, 'deleted object'];
      }
      return [key, 'deleted'];
    } else if (!Object.hasOwn(obj1, key) && Object.hasOwn(obj2, key)) {
      if (checkType(obj2[key], 'object')) {
        return [key, 'added object'];
      }
      // ключ добавлен
      return [key, 'added'];
    } else if (checkType(obj1[key], 'array') && checkType(obj2[key], 'array')) {
      if (_.isEqual(obj1[key], obj2[key])) {
        return [key, 'not changed'];
      }
    } else if (checkType(obj1[key], 'object') && checkType(obj2[key], 'object')) {
      if (_.isEqual(obj1[key], obj2[key])) {
        return [key, 'not changed object'];
      }
      return [key, 'object'];
    } else if (checkType(obj1[key], 'object') && checkType(obj2[key], 'other')) {
      return [key, 'object first'];
    } else if (checkType(obj1[key], 'other') && checkType(obj2[key], 'object')) {
      return [key, 'object second'];
    } else if (obj1[key] !== obj2[key]) {
      return [key, 'changed'];
    }
    return [key, 'not changed'];
  });
  return markedKeys;
}

// внизу я сделалa это с параметрами, потому что функция часто вызывается только на один объект
export function makeLines(data1, data2 = data1) {
  // на этом шаге сравниваются ключи двух объектов и каждому присваивается тег состояния (изменён или нет и пр.)
  // функция находится выше
  const keys = keysWithTags(data1, data2); 
  // result строится по шаблону: [str, status, key (опционально), object (опционально)].
  // насколько я помню (и мне недавно так сказал товарищ из другой группы),
  // классы в этом проекте не используются
  const lines = keys.map(([key, status]) => {
    switch (status) {
      case 'deleted object':
        return ['', status, key, makeLines(data1[key])];
      
      case 'deleted':
        return [`- ${key}: ${data1[key]}`.trim(), status];
        
      case 'added object':
        return ['', 'added object', key, makeLines(data2[key])];
        
      case 'added':
        return [`+ ${key}: ${data2[key]}`.trim(), status];
        
      case 'object':
        // это случай, когда оба значения - объекты, внутри которых тоже нужно всё сравнить
        return ['', status, key, makeLines(data1[key], data2[key])];
        
      case 'object first':
        // изменился с объекта на примитив или массив
        return [`+ ${key}: ${data2[key]}`.trim(), status, key, makeLines(data1[key])];
        
      case 'object second':
        // изменился на объект
        return [`- ${key}: ${data1[key]}`.trim(), status, key, makeLines(data2[key])];
        
      case 'changed':
        // просто изменился без лишних заморочек
        return [[`- ${key}: ${data1[key]}`.trim(), `+ ${key}: ${data2[key]}`.trim()], 'changed'];
        
      case 'not changed object':
        return ['', status, key, makeLines(data1[key])];
        
      default:
        // status === 'not changed'
        return [`${key}: ${data1[key]}`.trim(), status];
    }
  });
  return lines;
}

export function makeTreeFromArr(arrOfLines, repeatCount) {
  const gap = '  ';
  const gap1 = gap.repeat(repeatCount - 1);
  const gap2 = gap.repeat(repeatCount);
  const gap3 = gap.repeat(repeatCount - 2);
  const transGap = repeatCount + 2;
  const tree = arrOfLines.map((arr) => {
    const [line, status, key, obj] = arr;
    switch(status) {
      case 'deleted':
        return `${gap1}${line}`;
        
      case 'deleted object':
        return `${gap1}- ${key}: ${makeTreeFromArr(obj, transGap)}`;
      
      case 'added':
        return `${gap1}${line}`;
        
      case 'added object':
        return `${gap1}+ ${key}: ${makeTreeFromArr(obj, transGap)}`;
        
      case 'array':
        return `${gap1}${line[0]}\n${gap1}${line[1]}`;
        
      case 'object':
        return `${gap2}${key}: ${makeTreeFromArr(obj, transGap)}`;
        
      case 'object first':
        return `${gap1}- ${key}: ${makeTreeFromArr(obj, transGap)}\n${gap1}${line}`;
        
      case 'object second':
        return `${gap1}${line}\n${gap1}+ ${key}: ${makeTreeFromArr(obj, transGap)}`;
        
      case 'changed':
        return `${gap1}${line[0]}\n${gap1}${line[1]}`;
        
      case 'not changed object':
        return `${gap2}${key}: ${makeTreeFromArr(obj, transGap)}`;
        
      default:
        // status === 'not changed'
        return `${gap2}${line}`;
    }
  });
  return `{\n${tree.join('\n')}\n${gap3}}\n`.trim();
}
