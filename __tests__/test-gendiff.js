
import { fullKeyListCostructor } from "../bin/gendiff.js"

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

test('check fullKeyListConstructor', () => {
  expect(fullKeyListCostructor(file1, file2)).toEqual(['follow', 'host', 'proxy', 'timeout', 'verbose']);
  expect(fullKeyListCostructor(file2, file1)).toEqual(['follow', 'host', 'proxy', 'timeout', 'verbose']);
  expect(fullKeyListCostructor([], [])).toEqual([]);
});
