/**
 * LRU (Least Recently Used) 最近最少使用策略
 * 使用 散列表 + 双向链表 O(1) 复杂度实现
 * 暂不实现扩容功能，当 HashTable 容量达到 capacity 上限时，丢弃链表尾部元素
 */

class Node {
  constructor(val) {
    this.val = val;
    this.prev = null;
    this.next = null;
    this.hnext = null;
  }
}

class Table {
  constructor(capacity = 10) {
    this.capacity = capacity;
    this.table = {};
  }

  // range(0, 5)
  hashed(val) {
    if (!val) return 0;

    return (
      val
        .split('')
        .map(x => x.codePointAt(0))
        .reduce((sum, cur) => sum + cur, 0) % 5
    );
  }

  add(val) {
    const node = new Node(val);
    const hash = this.hashed(node.val);

    if (!this.table[hash]) {
      this.table[hash] = node;
      return node;
    }

    let last = this.table[hash];

    while (last.hnext) last = last.hnext;

    last.hnext = node;

    return node;
  }

  remove(val) {
    const hash = this.hashed(val);

    if (!this.table[hash]) return false;

    let current = this.table[hash];

    if (current.val === val) {
      this.table[hash] = current.hnext;
      return true;
    }

    while (current.val !== val && current.hnext) {
      if (current.hnext.val === val) {
        current.hnext = current.hnext.hnext;
        return true;
      }

      current = current.hnext;
    }

    return false;
  }

  get(val) {
    const hash = this.hashed(val);

    if (!this.table[hash]) return false;

    let current = this.table[hash];

    if (current.val === val) return current;

    while (current.val !== val && current.hnext) {
      if (current.hnext.val === val) return current.hnext;

      current = current.hnext;
    }

    return false;
  }

  toString() {
    return Object.keys(this.table)
      .map(key => {
        const values = [];
        let current = this.table[key];

        while (current) {
          values.push(current.val);
          current = current.hnext;
        }

        return `  ${key}: ${values.join(' -> ')}`;
      })
      .join('\n');
  }
}

// prettier-ignore
const genStr = () => Math.random().toString(36).substr(2, 8);

const THRESHOLD = 5;
const HEAD = new Node('$$$');
const fragments = new Array(THRESHOLD * 2).fill(1).map(genStr);
const t = new Table(THRESHOLD);

function LRU(val) {
  let node = t.get(val);

  if (node) {
    node.prev.next = node.next;
    node.prev = HEAD;
    node.next = HEAD.next;
    if (HEAD.next) HEAD.next.prev = node;
    HEAD.next = node;
    return;
  }

  node = t.add(val);
  node.prev = HEAD;
  node.next = HEAD.next;
  if (HEAD.next) HEAD.next.prev = node;
  HEAD.next = node;

  let current = HEAD.next;

  for (let i = 1; i <= THRESHOLD; i++) {
    if (i === THRESHOLD && current.next) {
      t.remove(current.next.val);
      current.next = null;
      return;
    }

    if (!current.next) break;

    current = current.next;
  }
}

function formatList() {
  const values = [];
  let current = HEAD;

  values.push(current.val);

  while (current.next) {
    values.push(current.next.val);
    current = current.next;
  }

  return '  ' + values.join(' -> ');
}

// start visting
new Array(THRESHOLD * 3).fill(1).forEach(() => {
  const i = ~~(Math.random() * fragments.length);
  const val = fragments[i];

  LRU(val);
  console.log('LRU visiting:', val);
  console.log('Table:\n' + t);
  console.log('List:\n' + formatList());
  console.log();
});
