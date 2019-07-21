/**
 * LRU (Least Recently Used) 最近最少使用策略
 * 使用 散列表 + 双向链表 O(1) 复杂度实现
 * 暂不实现扩容功能，当 Table 容量达到 LRU 预设上限时，丢弃链表尾部元素
 */

/**
 * 双向链表节点
 *
 * @property {string} val   节点值
 * @property {Node}   prev  前驱指针
 * @property {Node}   next  后驱指针
 * @property {Node}   hnext 链表中的后驱指针
 */
class Node {
  constructor(val) {
    this.val = val;
    this.prev = null;
    this.next = null;
    this.hnext = null;
  }
}

/**
 * 散列表 使用链表法处理访问冲突
 *
 * @function hashed
 * @function add
 * @function remove
 * @function get
 * @function toString
 */
class Table {
  constructor(capacity = 10) {
    this.size = 0;
    this.table = {};
    this.capacity = capacity;
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
    this.size++;
    const node = new Node(val);
    const hash = this.hashed(node.val);

    // 当前地址为空直接插入
    if (!this.table[hash]) {
      this.table[hash] = node;
      return node;
    }

    // 非空插入链表尾端
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
      this.size--;
      this.table[hash] = current.hnext;
      return true;
    }

    while (current.val !== val && current.hnext) {
      if (current.hnext.val === val) {
        this.size--;
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
const HEAD = new Node('$$$'); // 不存入 Table 的虚拟头 简化操作
const TAIL = new Node('$$$'); // 不存入 Table 的虚拟尾 简化操作

// 用于随机访问的片段 增加重复访问概念
const fragments = new Array(THRESHOLD * 2).fill(1).map(genStr);
const t = new Table(THRESHOLD);

function LRU(val) {
  let node = t.get(val);

  if (node) {
    // 在头部不用处理
    if (HEAD.next === node) return node;

    // 在尾部更新尾部指针
    if (TAIL.prev === node) TAIL.prev = node.prev;

    // 关联前后节点
    node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;

    // 更新自身指针
    node.prev = HEAD;
    node.next = HEAD.next;

    // 更新头部指针
    if (HEAD.next) HEAD.next.prev = node;
    HEAD.next = node;

    return node;
  }

  node = t.add(val);

  // 更新自身指针
  node.prev = HEAD;
  node.next = HEAD.next;

  // 更新头部指针
  if (HEAD.next) HEAD.next.prev = node;
  HEAD.next = node;

  if (!TAIL.prev) TAIL.prev = node;

  // 清理过时数据
  if (t.size > THRESHOLD) {
    t.remove(TAIL.prev.val);
    TAIL.prev = TAIL.prev.prev;
    TAIL.prev.next = null;
  }

  return node;
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
  console.log(`Table(size = ${t.size}):\n` + t);
  console.log('List:\n' + formatList());
  console.log();
});
