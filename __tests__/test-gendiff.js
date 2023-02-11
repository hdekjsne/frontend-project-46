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

console.log(fullKeyListCostructor(file1, file2));
