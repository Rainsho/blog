import { uniq } from 'lodash';

const arr = [1, 1, 1, 2, 2, 3];

console.log('before:', arr);
console.log('after:', uniq(arr));
