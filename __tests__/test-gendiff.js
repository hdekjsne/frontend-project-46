/* eslint-disable */

import { fullKeyListCostructor, makeArrLookLikeObj } from "../src/additional.js";
import gendiff from '../src/index.js';

const file1 = {
  "host": "hexlet.io",
  "timeout": 50,
  "proxy": "123.234.53.22",
  "follow": false
}

const file2 = {
  "timeout": 20,
  "verbose": true,
  "host": "hexlet.io"
}

const example = `{
  - follow: false
    host: hexlet.io
  - proxy: 123.234.53.22
  - timeout: 50
  + timeout: 20
  + verbose: true
}`

test('check fullKeyListConstructor', () => {
  expect(fullKeyListCostructor(file1, file2)).toEqual(['follow', 'host', 'proxy', 'timeout', 'verbose']);
  expect(fullKeyListCostructor(file2, file1)).toEqual(['follow', 'host', 'proxy', 'timeout', 'verbose']);
  expect(fullKeyListCostructor([], [])).toEqual([]);
});

test('check makeArrLookLikeObj', () => {
  const arr = [
    ['aaaaaa', 'aaaaaaaaaaaa'],
    ['question', 'a?'],
    ['not a string', 2],
    ['basket', ['eggs', 'milk', 'vinegar']]
  ];
  const str = `{\naaaaaa: aaaaaaaaaaaa\nquestion: a?\nnot a string: ${2}\nbasket: ${['eggs', 'milk', 'vinegar']}\n}`;
  expect(makeArrLookLikeObj(arr)).toEqual(str);
  expect(makeArrLookLikeObj([])).toEqual('{\n\n}');
});

test('check gendiff', () => {
  expect(gendiff('__tests__/file1.json', '__tests__/file2.json')).toEqual(example);
});
