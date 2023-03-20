import { keysWithTags } from './index.js';
import { checkValueType } from './utils.js';

/*
- deleted object / removed -
- deleted / removed - 
- added object / added -
- added / added -
- object / rec
- object first / changed  -
- object second / changed -
- changed / changed -
- not changed / -
*/

export function makePlain(obj1, obj2, path = '') {
  const keys = keysWithTags(obj1, obj2);
  const lines = keys.map(([key, status]) => {
    let intro = [path, key].join('.');
    if (intro.startsWith('.')) intro = intro.slice(1);
    if (status === 'deleted object' || status === 'deleted') {
      return `Property '${intro}' was removed\n`;
    } else if (status === 'added object' || status === 'added') {
      return `Property '${intro}' was added with value: ${checkValueType(obj2[key])}\n`;
    } else if (status === 'object first' || status === 'object second' || status === 'changed') {
      return `Property '${intro}' was updated. From ${checkValueType(obj1[key])} to ${checkValueType(obj2[key])}\n`;
    } else if (status === 'object') {
      return makePlain(obj1[key], obj2[key], intro) + '\n';
    }
  }).filter((line) => line !== undefined ? true : false);
  return lines.join('').trim();
}