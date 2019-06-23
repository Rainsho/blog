/**
 * 循环队列 Circular Queue
 */

class CircularQueue {
  constructor(len = 10) {
    this.queue = new Array(len);
    this.len = len;
    this.head = 0;
    this.tail = 0;
  }

  enqueue(val) {
    const isFull = this.tail === this.head && !!this.queue[this.tail];

    if (isFull) return false;

    this.queue[this.tail] = { val };
    this.tail = (this.tail + 1) % this.len;

    return true;
  }

  dequeue() {
    const ret = this.queue[this.head];

    if (ret) {
      this.queue[this.head] = undefined;
      this.head = (this.head + 1) % this.len;

      return ret.val;
    }

    return false;
  }

  format() {
    return this.queue.map(o => o && o.val);
  }
}

// prettier-ignore
const genStr = () => Math.random().toString(36).substr(2, 8);
const queue = new CircularQueue(5);

for (let i = 0; i < 8; i++) {
  const str = genStr();
  console.log('ENQUEUE:', str, queue.enqueue(str), queue.format());
}

for (let i = 0; i < 20; i++) {
  if (Math.random() > 0.5) {
    const str = genStr();
    console.log('ENQUEUE:', str, queue.enqueue(str), queue.format());
  } else {
    console.log('DEQUEUE:', queue.dequeue(), queue.format());
  }
}
