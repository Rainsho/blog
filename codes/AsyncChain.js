/**
 * AsyncChain for Promise function
 */
class AsyncChain {
  constructor() {
    /**
     * @prop  {Array<group>}           queue
     * @param {Array<work>}            group
     * @param {function: Promise<any>} work
     *
     * work in the same group are parallel loaded
     */
    this.queue = [];
  }

  _pushGroup() {
    this.queue.push([]);
  }

  _add(work) {
    if (this.queue.length === 0) {
      this._pushGroup();
    }

    this.queue[this.queue.length - 1].push(work);
  }

  _loadGroup(group) {
    return Promise.all(group.map(work => this._loadWork(work)));
  }

  _loadWork(work) {
    /**
     * customized if needed!
     */
    return Promise.resolve(work());
  }

  add(work) {
    this._add(work);
    return this;
  }

  wait() {
    this._pushGroup();
    return this;
  }

  run() {
    let chainedPromise = Promise.resolve();

    for (const group of this.queue) {
      chainedPromise = chainedPromise.then(() => this._loadGroup(group));
    }

    chainedPromise.catch(e => {
      console.trace(e);
    });

    this.queue = [];
  }
}

/*
// example
const w1 = () =>
  new Promise((res, rej) => {
    const r = ~~(Math.random() * 1500);
    setTimeout(res, r, r);
  }).then(r => {
    console.info('work_w1 done got:', r);
  });

const w2 = () =>
  new Promise((res, rej) => {
    const r = ~~(Math.random() * 500);
    setTimeout(res, r, r);
  }).then(r => {
    console.info('work_w2 done got:', r);
  });

new AsyncChain()
  .add(w1)
  .add(w1)
  .add(w1)
  .add(w1)
  .wait()
  .add(w2)
  .add(w2)
  .add(w2)
  .run();
*/
