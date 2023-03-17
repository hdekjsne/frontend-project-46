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
- not changed object
- not changed or default
*/

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
