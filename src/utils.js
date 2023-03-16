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
  // строчка ниже выдаёт ошибку из скрина
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

/*
Список всех тэгов ещё раз:
- deleted
- deleted object *
- added
- added object *
- array / both
- object / both
- object first
- object second
- changed
- not changed or default
*/

export function makeTreeFromArr(arrOfLines, repeat = 1) {
  // сразу определяем стандартный отступ
  const gap = '  ';
  // дальше для каждого случая определяется свой способ формирования итоговой строки
  const tree = arrOfLines.map((arr) => {
    const [line, status, key, obj] = arr;
    switch(status) {
      case 'deleted':
        return `${gap.repeat(repeat)}${line}`;
        
      case 'deleted object':
        return `${gap.repeat(repeat - 1)}- ${key}: ${makeTreeFromArr(obj)}`;
      
      case 'added':
        return `${gap.repeat(repeat)}${line}`;
        
      case 'added object':
        return `${gap.repeat(repeat - 1)}+ ${key}: ${makeTreeFromArr(obj)}`;
        
      case 'array':
        return `${gap.repeat(repeat - 1)}${line[0]}\n${gap.repeat(repeat - 1)}${line[1]}`;
        
      case 'object':
        return `${gap.repeat(repeat)}${key}: ${makeTreeFromArr(obj, repeat + 2)}`;
        
      case 'object first':
        return `${gap.repeat(repeat - 1)}- ${key}: ${makeTreeFromArr(obj, repeat + 2)}\n${gap.repeat(repeat - 1)}${line}`;
        
      case 'object second':
        return `${gap.repeat(repeat - 1)}${line}\n${gap.repeat(repeat - 1)}+ ${key}: ${makeTreeFromArr(obj, repeat + 2)}`;
        
      case 'changed':
        return `${gap.repeat(repeat - 1)}${line[0]}\n${gap.repeat(repeat - 1)}${line[1]}`;
        
      default:
        // status === 'not changed'
        return `${gap.repeat(repeat)}${line}`;
    }
  });
  // строки объединяются спомощью \n и заключаются в {}
  // должно плучиться готовое дерево
  return `{\n${tree.join('\n')}\n${gap}.repeat(repeat - 1)}}\n`.trim();
}
