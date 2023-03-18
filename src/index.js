// import * as fs from 'node:fs';
import { parse } from './parsers.js';
import { makeLines, makeTreeFromArr } from './utils.js';

export default function gendiff(path1, path2) {
  // парсим файлы
  // функция: src/parsers.js
  const data1 = parse(path1);
  const data2 = parse(path2);
  // внизу получаем из данных готовые строки для объединения, функция выше
  const preResult = makeLines(data1, data2);
  // следующая строчка собирает строки из предыдущей в одну большую древовидную строку
  // функция: src/utils.js
  return makeTreeFromArr(preResult, 2);
}
