/**
 * LRU (Least Recently Used) 最近最少使用策略
 * 使用 双向链表 数据结构
 */

class Node {
  constructor(val) {
    this.val = val;
    this.prev = null;
    this.next = null;
  }
}

// prettier-ignore
const genStr = () => Math.random().toString(36).substr(2, 8);

const THRESHOLD = 5;
const visitTimes = THRESHOLD * 3;
const fragments = new Array(THRESHOLD * 2).fill(1).map(genStr);
const first = new Node('$$$');

function visitor(val, current = first, i = 0) {
  // delete last and insert a new node
  if (i === THRESHOLD) {
    current.prev.next = null;

    const second = new Node(val);

    second.prev = first;
    second.next = first.next;
    first.next.prev = second;
    first.next = second;

    return;
  }

  // put current to first
  if (current.val === val) {
    if (current.prev) {
      current.prev.next = current.next;
    }

    if (current.next) {
      current.next.prev = current.prev;
    }

    current.prev = first;
    current.next = first.next;

    if (first.next) {
      first.next.prev = current;
    }

    first.next = current;

    return;
  }

  // insert a new node
  if (current.next === null) {
    const second = new Node(val);

    second.prev = first;
    second.next = first.next;

    if (first.next) {
      first.next.prev = second;
    }

    first.next = second;

    return;
  }

  visitor(val, current.next, i + 1);
}

function printList(val) {
  const lists = [];

  function getVal(current = first) {
    lists.push(current.val);

    if (current.next) getVal(current.next);
  }

  getVal();

  console.log('visit', val);
  console.log(lists.join(' -> '));
}

// start visting
new Array(visitTimes).fill(1).forEach(() => {
  const i = ~~(Math.random() * fragments.length);
  const val = fragments[i];

  visitor(val);
  printList(val);
});
