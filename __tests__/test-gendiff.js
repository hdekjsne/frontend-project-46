import * as fs from 'node:fs';
import { fullKeyListConstructor, checkType } from '../src/utils.js';
import { default as parse } from '../src/parsers.js';
import gendiff from '../src/index.js';
import { makeObj } from '../src/formatter.js';

const file1 = {
  host: 'hexlet.io',
  timeout: 50,
  proxy: '123.234.53.22',
  follow: false
};

const file2 = {
  'timeout': 20,
  'verbose': true,
  'host': 'hexlet.io'
};

const file3 = {
  'day': 'Tue',
  'weather': ['freezy', 'snowy', 'cloudy'],
  'temperature': {
    'min': -5,
    'max': 1
  }
};

const example2 = `{
    common: {
      + follow: false
        setting1: Value 1
      - setting2: 200
      - setting3: true
      + setting3: null
      + setting4: blah blah
      + setting5: {
            key5: value5
        }
        setting6: {
            doge: {
              - wow: 
              + wow: so much
            }
            key: value
          + ops: vops
        }
    }
    group1: {
      - baz: bas
      + baz: bars
        foo: bar
      - nest: {
            key: value
        }
      + nest: str
    }
  - group2: {
        abc: 12345
        deep: {
            id: 45
        }
    }
  + group3: {
        deep: {
            id: {
                number: 45
            }
        }
        fee: 100500
    }
}`;

test('check parser', () => {
  expect(parse('__fixtures__/file3.yml')).toEqual(file3);
});

test('check fullKeyListConstructor', () => {
  expect(fullKeyListConstructor(file1, file2)).toEqual(['follow', 'host', 'proxy', 'timeout', 'verbose']);
  expect(fullKeyListConstructor(file2, file1)).toEqual(['follow', 'host', 'proxy', 'timeout', 'verbose']);
  expect(fullKeyListConstructor([], [])).toEqual([]);
});

test('check checkType', () => {
  expect(checkType({}, 'object')).toBe(true);
  expect(checkType([], 'object')).toBe(false);
  expect(checkType('a', 'object')).toBe(false);
  expect(checkType([], 'array')).toBe(true);
  expect(checkType({}, 'array')).toBe(false);
  expect(checkType(1, 'array')).toBe(false);
  expect(checkType(1, 'other')).toBe(true);
  expect(checkType([], 'other')).toBe(false);
  expect(checkType(Infinity, 'other')).toBe(true);
});

test('check formatter stylish', () => {
  expect(gendiff('__fixtures__/file-recursive-1.json', '__fixtures__/file-recursive-2.json', 'stylish')).toEqual(example2);
});

test('check formatter plain', () => {
  const result = fs.readFileSync('__fixtures__/file-plain.txt', 'utf-8');
  expect(gendiff('__fixtures__/file-recursive-1.json', '__fixtures__/file-recursive-2.json', 'plain')).toEqual(result);
});

test('check formatter json', () => {
  const res = {
    follow: makeObj('follow', 'removed', false, undefined),
    host: makeObj('host', 'not changed', 'hexlet.io', 'hexlet.io'),
    proxy: makeObj('proxy', 'removed', '123.234.53.22', undefined),
    recursive: makeObj('recursive', 'nested', { a: makeObj('a', 'not changed', 'aa', 'aa'), b: makeObj('b', 'removed', 'bb', undefined) }, undefined),
    recursive2: makeObj('recursive2', 'added', undefined, { str: "i am so tired of this" }),
    timeout: makeObj('timeout', 'changed', 50, 20),
    verbose: makeObj('verbose', 'added', undefined, true)
  };
  const result = JSON.stringify(res, '', 2);
  expect(gendiff('__fixtures__/file-recursive-3.json', '__fixtures__/file-recursive-4.json', 'json')).toEqual(result);
});
