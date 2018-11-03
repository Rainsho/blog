/**
 * @xufei 大神 《RxJS 入门指引和初步应用》
 * https://github.com/xufei/blog/issues/44
 *
 * 示例五：幸福人生 示例代码的 rxjs 6 写法
 */

import { interval, Subject, merge } from 'rxjs';
import { mapTo, scan, startWith, withLatestFrom, map } from 'rxjs/operators';

const salary$ = interval(100).pipe(mapTo(2));
const house$ = new Subject();
const houseCount$ = house$
  .pipe(scan((acc, num) => acc + num, 0))
  .pipe(startWith(0));
const rent$ = interval(3000)
  .pipe(withLatestFrom(houseCount$))
  .pipe(map(arr => arr[1] * 5));

const income$ = merge(salary$, rent$);
const cash$ = income$.pipe(
  scan((acc, num) => {
    const newSum = acc + num;
    const newHouse = Math.floor(newSum / 100);

    if (newHouse > 0) {
      house$.next(newHouse);
    }

    return newSum % 100;
  }, 0)
);

houseCount$.subscribe(num => console.log(`houseCount: ${num}`));
cash$.subscribe(num => console.log(`cash: ${num}`));
