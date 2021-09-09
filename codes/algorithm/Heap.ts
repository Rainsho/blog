/**
 * 堆实现
 * @ref https://time.geekbang.org/column/article/69913
 */

class Heap<T> {
  private data: Array<T>;
  private compare: (a: T, b: T) => boolean;

  constructor(compare: (a: T, b: T) => boolean = (a: T, b: T) => a > b) {
    this.data = [];
    this.compare = compare;
  }

  get size(): number {
    return this.data.length;
  }

  get most(): T {
    return this.data[0];
  }

  private swap(i: number, j: number): void {
    const t = this.data[i];
    this.data[i] = this.data[j];
    this.data[j] = t;
  }

  insert(t: T): number {
    this.data.push(t);

    let i = this.data.length - 1;

    while (i > 0) {
      const p = Math.floor((i - 1) / 2);

      if (!this.compare(this.data[i], this.data[p])) break;

      this.swap(i, p);
      i = p;
    }

    return this.size;
  }

  pop(): T {
    if (this.data.length <= 1) return this.data.pop();

    const first = this.data[0];
    const last = this.data.pop();

    this.data[0] = last;
    let i = 0;

    while (i * 2 + 1 < this.size) {
      let p = i;

      if (this.compare(this.data[i * 2 + 1], this.data[i])) {
        p = i * 2 + 1;
      }

      if (i * 2 + 2 < this.size && this.compare(this.data[i * 2 + 2], this.data[p])) {
        p = i * 2 + 2;
      }

      if (i === p) break;

      this.swap(i, p);
      i = p;
    }

    return first;
  }
}

// const heap = new Heap<number>();

// new Array(50).fill(0).forEach(() => {
//   heap.insert(Math.random());
// });

// let t = null;

// while ((t = heap.pop())) {
//   console.log(t);
// }
