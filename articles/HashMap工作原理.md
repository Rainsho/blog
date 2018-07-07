# HashMap工作原理

[原文：How does a HashMap work in JAVA](http://coding-geek.com/how-does-a-hashmap-work-in-java/ "How does a HashMap work in JAVA")

[TOC]

## 内部存储
interface Map&lt;K, V>

* V put(K key, V value)
* V get(Object key)
* V remove(Object key)
* Boolean containsKey(Object key)

HashMaps使用内部类Entry&lt;K, V>储存数据

```JAVA
static class Entry<K, V> implements Map.Entry<K, V>{
	final K key;
	V value;
	// 类似链表
	Entry<K, V> next;
	// 用来存储key的hash值，并决定entry的存储位置，若key的hash值改变可能无法get()
	int hash;
    ...
}
```

> A HashMap stores data into multiple singly linked lists of entries (also called buckets or bins). All the lists are registered in an array of Entry (Entry<K,V>[] array) and the default capacity of this inner array is 16.

***数据存储在多个链表中，默认大小16，默认加载因子0.75。***

|index 0|index 1|...|index n|
|:--:|:--:|:--:|:--:|
|EntryA|**null**|...|EntryZ|
|EntryB|||**null**|
|EntryC|
|**null**|

***竖排构成链表，hash值相同的在同一链表（桶）内。***  
链表的index产生分三步：

1. 获得key的hashcode
2. rehashcode（避免将所有key分配到同一个桶内）
3. bit-masks（分配到有限的桶内）

```JAVA
// rehash in JAVA7
h^=(h>>>20)^(h>>>12);
return h^(h>>>7)^(h>>>4);
// rehash in JAVA8
return (key==null)? 0 : (h=key.hashCode())^(h>>>16);
// bit-masks
return h & (length-1);
```

## 自动扩容
> After getting the index, the function (get, put or remove) visits/**iterates** the associated linked list to see if there is an existing Entry for the given key.

获得链表index后，迭代在链表中查找key。  
当数据量较大时，链表数量较少会影响效率，因此会Auto resizing。检查是否需要扩容，涉及两个data：

1. size（updated when added or removed）
2. threshold （下限 = 内部数组容量 * 加载因子）

adding前检查size > threshold，若true则array.size * 2，并且重新分配桶。

## 线程（不）安全
由于自动扩容机制(auto-resizing mechanism)，可能找不到新桶。**HashTable**线程安全，但效率较差（废话！）。**ConcurrentHashMap**仅线程同步buckets，多线可程考虑使用。

## 键的不可变性
String和Integer是比较好的key实现，因为他们不可变(immutable)。如果使用自定义类作为key，可能lose data inside the HashMap。  
注意：HashMap内保存的Entity内也保存的有key的hash值，若因key的属性改变从而导致hash值改变，则在HashMap内无法找到。

> the map first compares the hash values and then calls the equals() comparison

## JAVA8的改进
array由Entity&lt;K, V>改为Node&lt;K, V>，Node可以被extended成TreeNode（一种红黑树的数据结构，存储更多信息），add/delete/get的复杂度为O(log(n))。

```JAVA
static final class TreeNode<K,V> extends LinkedHashMap.Entry<K,V> {
    final int hash; // inherited from Node<K,V>
    final K key; // inherited from Node<K,V>
    V value; // inherited from Node<K,V>
    Node<K,V> next; // inherited from Node<K,V>
    Entry<K,V> before, after;// inherited from LinkedHashMap.Entry<K,V>
    TreeNode<K,V> parent;
    TreeNode<K,V> left;
    TreeNode<K,V> right;
    TreeNode<K,V> prev;
    boolean red;
    ...
}
```

> Red black trees are self-balancing binary search trees. Their inner mechanisms ensure that their length is always in log(n) despite new adds or removes of nodes. The main advantage to use those trees is in a case where many data are in the same index (bucket) of the inner table, the search in a tree will cost O(log(n)) whereas it would have cost O(n) with a linked list.  
> By inheritance, the inner table can contain both Node (linked list ) and TreeNode (red-black tree). Oracle decided to use both data structures with the following rules:
* If for a given index (bucket) in the inner table there are more than 8 nodes, the linked list is transformed into a red black tree
* If for a given index (bucket) in the inner table there are less than 6 nodes, the tree is transformed into a linked list

![internal_storage_java8_hashmap](pic/internal_storage_java8_hashmap.jpg)

简言之：红黑树是自平衡的二分查找树，内部机制保证其为log(n)的深度。对一个给定的桶，如果内部节点大于8个则将链表转换为红黑树，如果小于6个则将树转换为链表。

## 内存开销
### JAVA7
* An entry has: next_entry/hash/key/value
* inner array

etc: N elements + inner_array.capacity=CAPACITY
memory cost is **approximately**:  
sizeOf(integer)*N + sizeOf(reference)*(3*N+C)

### JAVA8
etc: all nodes are TreeNodes **(approximately)**:  
N*sizeOf(integer) + N*sizeOf(boolean) + sizeOf(reference)*(9*N+C)

## 性能问题
### 平衡/不平衡的HashMap
考虑**计算hash的方法**，最好情况下get/put方法时间复杂度为O(1)，最差为O(n)，此时所有的entit在一个桶内。

### 扩容的开销
如果需要存储很多数据，应该制定初始的capacity。否则，第12次put(16*0.75)时将会应为inner_array的扩容（和内部链表或树的更新）而消耗很大的运算。

## 结论
> For simple use cases, you don’t need to know how HashMaps work since you won’t see the difference between a O(1) and a O(n) or O(log(n)) operation. But it’s always better to understand the underlaying mecanism of one of the most used data structures. Moreover, for a java developer position it’s a typical interview question.
