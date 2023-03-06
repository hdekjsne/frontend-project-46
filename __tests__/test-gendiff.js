import { fullKeyListConstructor, makeArrLookLikeObj } from "../src/utils.js";
import { parse } from "../src/parsers.js";
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

const file3 = {
  "day": "Tue",
  "weather": ["freezy", "snowy", "cloudy"],
  "temperature": {
    "min": -5,
    "max": 1
  }
}

const example = `{
  - follow: false
    host: hexlet.io
  - proxy: 123.234.53.22
  - timeout: 50
  + timeout: 20
  + verbose: true
}`

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
}`

test('check parser', () => {
  expect(parse('__fixtures__/file3.yml')).toEqual(file3);
});

test('check fullKeyListConstructor', () => {
  expect(fullKeyListConstructor(file1, file2)).toEqual(['follow', 'host', 'proxy', 'timeout', 'verbose']);
  expect(fullKeyListConstructor(file2, file1)).toEqual(['follow', 'host', 'proxy', 'timeout', 'verbose']);
  expect(fullKeyListConstructor([], [])).toEqual([]);
});

test('check makeArrLookLikeObj', () => {
  const arr = [
    'aaaaaa: aaaaaaaaaaaa',
    'question: a?',
    'not a string: ${2}',
    'basket: [\'eggs\', \'milk\', \'vinegar\']'
  ];
  const str = `{\naaaaaa: aaaaaaaaaaaa\nquestion: a?\nnot a string: ${2}\nbasket: ${['eggs', 'milk', 'vinegar']}\n}`;
  expect(makeArrLookLikeObj(arr)).toEqual(str);
  expect(makeArrLookLikeObj([])).toEqual('{\n\n}');
});

test('check gendiff', () => {
  expect(gendiff('__fixtures__/file1.json', '__fixtures__/file2.json')).toEqual(example);
  expect(gendiff('__fixtures__/file-recursive-1.json', '__fixtures__/file-recursive-2.json')).toEqual(example2);
});
