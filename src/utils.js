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
      // ключ удалён
      return [key, 'deleted'];
    } else if (!Object.hasOwn(obj1, key) && Object.hasOwn(obj2, key)) {
      // ключ добавлен
      return [key, 'added'];
    } else if (obj1[key] !== obj2[key]) {
      if (_.isArray(obj1[key]) && _.isArray(obj2[key])) {
        // исключаем массивы, потому что _.isObject детектит массив как объект
        return [key, 'array'];
      } else if ((_.isObject(obj1[key]) && !_.isArray(obj1[key])) && (_.isObject(obj2[key]) && !_.isArray(obj2[key]))) {
        // объекты в обоих случаях
        return [key, 'object'];
      } else if (_.isObject(obj1[key]) && !_.isArray(obj1[key])) {
        // ключ был изменён с объекта на примитив или массив
        return [key, 'object first'];
      } else if (_.isObject(obj2[key]) && !_.isArray(obj2[key])) {
        // ключ был изменён с примитива или массива на объект
        return [key, 'object second'];
      }
      // примитив, который просто изменили
      return [key, 'changed'];
    }
    // ничего не изменилось
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
      case 'deleted':
        // значение было объектом
        if (_.isObject(data1[key]) && !_.isArray(data1[key])) {
          return ['', 'deleted object', key, makeLines(data1[key])];
        }
        // значение было примитивом
        return [`- ${key}: ${data1[key]}`.trim(), status];
        
      case 'added':
        // значение стало объектом
        if (_.isObject(data2[key]) && !_.isArray(data2[key])) {
        return ['', 'added object', key, makeLines(data2[key])];
        }
        // значение стало примитивом
        return [`+ ${key}: ${data2[key]}`.trim(), status];
      
      case 'array':
        // сравнение двух массивов
        // ничего не изменилось
        if (_.isEqual(data1[key], data2[key])) {
          return [`${key}: ${data1[key]}`.trim(), 'not changed'];
        }
        // изменилось
        return [[`- ${key}: ${data1[key]}`.trim(), `+ ${key}: ${data2[key]}`.trim()], 'changed'];
        
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
        
      default:
        // status === 'not changed'
        if (_.isObject(data1[key]) && !_.isArray(data1[key])) {
          return ['', 'not changed object', key, makeLines(data1[key])];
        }
        return [`${key}: ${data1[key]}`.trim(), status];
    }
  });
  return lines;
}

export function makeTreeFromArr(arrOfLines, repeatCount) {
  // сразу определяем стандартный отступ
  const gap = '  ';
  const gap1 = gap.repeat(repeatCount - 1);
  const gap2 = gap.repeat(repeatCount);
  const gap3 = gap.repeat(repeatCount - 2);
  const transGap = repeatCount + 2;
  // дальше для каждого случая определяется свой способ формирования итоговой строки
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
  // строки объединяются спомощью \n и заключаются в {}
  // должно плучиться готовое дерево
  return `{\n${tree.join('\n')}\n${gap3}}\n`.trim();
}
