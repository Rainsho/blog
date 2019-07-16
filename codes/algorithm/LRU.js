/**
 * LRU (Least Recently Used) 最近最少使用策略
 * 使用 散列表 + 双向链表 O(1) 复杂度实现
 */

class Node {
  constructor(val) {
    this.val = val;
    this.prev = null;
    this.next = null;
    this.hnext = null;
  }
}

class HashTable {
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
      return val;
    }

    let last = this.table[hash];

    while (last.hnext) last = last.hnext;

    last.hnext = node;

    return val;
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

  has(val) {
    const hash = this.hashed(val);

    if (!this.table[hash]) return false;

    let current = this.table[hash];

    if (current.val === val) return true;

    while (current.val !== val && current.hnext) {
      if (current.hnext.val === val) return true;

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

        return `${key}: ${values.join(' -> ')}`;
      })
      .join('\n');
  }
}

// prettier-ignore
const genStr = () => Math.random().toString(36).substr(2, 8);
