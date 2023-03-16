// import * as fs from 'node:fs';
import _ from 'lodash';
import { fullKeyListConstructor, makeTreeFromArr } from './utils.js';
import { parse } from './parsers.js';

function keysWithTags(obj1, obj2) {
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
        return [key, 'object first', keysWithTags(obj1[key])];
      } else if (!_.isArray(obj2[key]) && _.isObject(obj2[key])) {
        // ключ был изменён с примитива или массива на объект
        return [key, 'object second', keysWithTags(obj2[key])];
      }
      // примитив, который просто изменили
      return [key, 'changed'];
    }
    // ничего не изменилось
    return [key, 'not changed'];
  });
  return markedKeys;
}

/*
Список всех тэгов отдельно:
- deleted
- deleted object *
- added
- added object *
- array / both
- object / both
- object first
- object second
- changed
- not changed
*/

// внизу я сделало это с параметрами, потому что функция часто вызывается только на один объект
function makeLines(data1, data2 = data1) {
  // на этом шаге сравниваются ключи двух объектов и каждому присваивается тег состояния (изменён или нет и пр.)
  // функция находится выше
  const keys = keysWithTags(data1, data2); 
  // result строится по шаблону: str, status, key (опционально), object (опционально). 
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
        return [`- ${key}: ${data1[key]}`, status];
        
      case 'added':
        // значение стало объектом
        if (_.isObject(data2[key]) && !_.isArray(data2[key])) {
        return ['', 'added object', key, makeLines(data2[key])];
        }
        // значение стало примитивом
        return [`+ ${key}: ${data2[key]}`, status];
      
      case 'array':
        // сравнение двух массивов
        // ничего не изменилось
        if (_.isEqual(data1[key], data2[key])) {
          return [`${key}: ${data1[key]}`, 'not changed'];
        }
        // изменилось
        return [[`- ${key}: ${data1[key]}`, `+ ${key}: ${data2[key]}`], 'changed'];
        
      case 'object':
        // вот здесь возникла большая проблема
        // это случай, когда оба значения - объекты
        return ['', status, key, makeLines(data1[key], data2[key])];
        
      case 'object first':
        // изменился с объекта на примитив или массив
        return [`+ ${key}: ${data2[key]}`, status, key, makeLines(data1[key])];
        
      case 'object second':
        // изменился на объект
        return [`- ${key}: ${data1[key]}`, status, key, makeLines(data2[key])];
        
      case 'changed':
        // просто изменился без лишних заморочек
        return [[`- ${key}: ${data1[key]}`, `+ ${key}: ${data2[key]}`], 'changed'];
        
      default:
        // status === 'not changed'
        return [`${key}: ${data1[key]}`, status];
    }
  });
// это просто для самопроверки
//  console.log(lines);
//  return makeTreeFromArr(lines, repeat);
  return lines;
// тоже для самопроверки
//  return {values: lines};
}

export default function gendiff(path1, path2) {
  // парсим файлы
  // функция: src/parsers.js
  // здесь пока всё работает
  const data1 = parse(path1);
  const data2 = parse(path2);
  // внизу получаем из данных готовые строки для объединения, функция выше
  const preResult = makeLines(data1, data2);
  // следующая строчка собирает строки из предыдущей в одну большую древовидную строку
  // функция: src/utils.js
  return makeTreeFromArr(preResult);
  // самопроверка
  // return JSON.stringify(preResult);
}

console.log(gendiff('__fixtures__/file-recursive-1.json', '__fixtures__/file-recursive-2.json'));
