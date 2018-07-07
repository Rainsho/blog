/**
 * tj 大神 co 模块的伪实现
 * https://github.com/tj/co
 *
 * 用于 Generator 函数的自动执行 (流程管理)
 * 受 redux-saga [ˈsägə] 启发
 */

/* ---- 使用 next(value) 作为 yield 返回 ---- */

function requestAsync() {
  console.log('start request');
  new Promise(res => setTimeout(res, 2000, Math.random())).then(result => g.next(result));
}

function* gen() {
  console.log('start gen');
  const result = yield requestAsync();
  console.log(result);
}

// 准备好 g 此时 gen 内部并未执行
const g = gen();

/**
 * 0. --> g.next().done === false
 * 1. --> console.log('start gen')
 * 2. --> yield requestAsync() && PAUSE!!!
 * 3. --> requestAsync 内部 Promise resolve 后 result => g.next(result)
 * 4. --> gen 内部继续执行 && (yield requestAsync()) => result && console.log(result)
 * 5. --> g.next(result).done === true
 */
g.next();

/* ---- co 伪实现 ---- */

/**
 * @param {function*} gen
 *
 * 0. --> gen() => g
 * 1. --> g.next(res: undefined) --> (yield new Promise...)
 * 2. --> ret = g.next(res: undefined) => ret.value: Promise<val>
 * 2. --> ret.value.then(onFulfilled) => onFulfilled(val)
 * 3. --> g.next(val) --> (yield new Promise...) => val
 * 4. --> const res = val ...
 * 5. --> yield ...
 */
function co(gen) {
  return new Promise((resolve, reject) => {
    const g = gen();

    onFulfilled();

    function onFulfilled(res) {
      let ret;
      try {
        ret = g.next(res);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    function next(ret) {
      if (ret.done) return resolve(ret.value);
      return ret.value.then(onFulfilled);
    }
  });
}

co(function*() {
  const res1 = yield new Promise(res => setTimeout(res, 2500, 10));
  console.log(res1);
  const res2 = yield new Promise(res => setTimeout(res, 500, res1 + 10));
  console.log(res2);
  const res3 = yield new Promise(res => setTimeout(res, 500, res2 + 10));
  console.log(res3);
});
