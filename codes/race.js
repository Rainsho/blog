/**
 * Promise.race 竞速实例
 * 该策略可以做一些很神奇的事情
 * god bless me ~
 */

const radio = 0.95;
const racer = 5;
let count = 0;
let done = false;

function mockReq(no) {
  return done || Promise.resolve()
    .then(() => Math.random())
    .then((r) => {
      return new Promise((res, rej) => {
        const wait = ~~(1000 + Math.random() * 500);
        const seq = no === 0
          ? count++ + ''
          : no + '-' + count++;
        console.log('no:', seq, 'wait:', wait, 'r:', r);
        r > radio
          ? setTimeout(res, wait, { r, seq })
          : setTimeout(rej, wait, seq);
      })
    })
    .catch(mockReq);
}

console.log(`try to get a number greater than ${radio} in ${racer} racers`);

Promise.race(new Array(racer).fill(0).map(mockReq))
  .then(({ r, seq }) => (done = true) && console.log('got', r, 'by', seq));
