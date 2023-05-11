# gendiff
Student-project at [Hexlet](https://ru.hexlet.io). 
Gendiff compares two json/yaml files and shows a difference between them.

### Hexlet tests and linter status:
[![Actions Status](https://github.com/hdekjsne/frontend-project-46/workflows/hexlet-check/badge.svg)](https://github.com/hdekjsne/frontend-project-46/actions)

### Code Climate:
<a href="https://codeclimate.com/github/hdekjsne/frontend-project-46/maintainability"><img src="https://api.codeclimate.com/v1/badges/387f1668d1b6eff46fda/maintainability" /></a> <a href="https://codeclimate.com/github/hdekjsne/frontend-project-46/test_coverage"><img src="https://api.codeclimate.com/v1/badges/387f1668d1b6eff46fda/test_coverage" /></a>

### GitHub Actions:
[![lint](https://github.com/hdekjsne/frontend-project-46/actions/workflows/check.yml/badge.svg)](https://github.com/hdekjsne/frontend-project-46/actions/workflows/check.yml)

[![asciicast](https://asciinema.org/a/OLs6wYEWVD41BGMI7OzXA1scr.svg)](https://asciinema.org/a/OLs6wYEWVD41BGMI7OzXA1scr)

## Usage
**As a CLI**: `gendiff file1.json file2.json`  
**As a lib**: `gendiff('file1.json', 'file2.json');`
## Formats
gendiff supports 3 formats.
#### stylish (default)
`gendiff -f stylish` or just `gendiff` with no specified format-option. 
In this mode gendiff bulds a json-like string, in which all the changed keys are represented with '+' and '-' signs.
Added:     `+ key: value`
Removed:   `- key: value`
Changed:   `- key: old-value`
           `+ key: new-value`
Unchanged: `  key: value` 

![8BC428EA-69FB-49F7-8FE5-029FD71E57F7](https://user-images.githubusercontent.com/116126396/226591741-e614e72f-c560-4dc2-9f09-40137bf7c5ae.jpeg)

#### plain
`gendiff -f plain` 
The output is represented as a plain text. One line is for one changed node. The nested nodes are recorded as a path to them, where each parent is separated from the kid with a dot. Complex values (such as objects, lists, arrays, functions) are hard to picture in one-line string, so `[complex value]` is used instead. 

![7BAE0BE8-5940-405E-8A61-A58781A1DDF1](https://user-images.githubusercontent.com/116126396/226591006-613584f9-53e8-462b-b1ee-cc48f26fe680.jpeg)

#### json
`gendiff -f json` 
Sometimes it's needed to get a json with the information on the performed changes. The structure of the output is described below. 
`key: {
  key: key,
  type: type,
  value1: old-value,
  value2: new-value,
}` 
There are 5 types for keys:
- added. In this case `value1` remains empty.
- removed. `value2` remains empty
- changed.
- unchanged. Gendiff puts the value into `value1`.
- nested. That means that the key is a nested node. The same output for it's kid is inside `value1`. 

![5DD1B24B-AD2C-487F-AD50-2FB7AAC61A74](https://user-images.githubusercontent.com/116126396/226591008-65e4c1c4-ec94-47c5-a2b6-c0758ed86c75.jpeg)

---
*Причина отсутствия аскинем - поломка компьютера и вынужденный переход на айпад.*
