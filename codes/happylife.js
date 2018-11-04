/**
 * @xufei 大神 《RxJS 入门指引和初步应用》
 * https://github.com/xufei/blog/issues/44
 *
 * 示例五：幸福人生 示例代码的 rxjs 6 写法
 */

import { interval, Subject, merge } from 'rxjs';
import { map, mapTo, scan, startWith, withLatestFrom } from 'rxjs/operators';

// 赚钱是为了买房，买房是为了赚钱
const house$ = new Subject();
const houseCount$ = house$
  .pipe(scan((acc, num) => acc + num, 0))
  .pipe(startWith(0));

// 工资 := 定时取值的常量
const salary$ = interval(100).pipe(mapTo(2));

// 房租 := 定时取值的变量，与房子数量成正比
const rent$ = interval(3000)
  .pipe(withLatestFrom(houseCount$))
  .pipe(map(arr => arr[1] * 5));

// 收入 := 工资 + 房租
const income$ = merge(salary$, rent$);

// 钱 := 收入.map(够了就买房)
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

/**
 * 业务逻辑：
 *
 *             工资周期  ———>  工资
 *                             ↓
 * 房租周期  ———>  租金  ———>  收入  ———>  现金
 *                 ↑           ↓
 *              房子数量 <——— 新购房
 */

houseCount$.subscribe(num => console.log(`houseCount: ${num}`));
cash$.subscribe(num => console.log(`cash: ${num}`));
