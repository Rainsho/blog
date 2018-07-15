# Decorator 与 OOP

ES7 修饰器模式与 JS 面向对象的一些小结，参考：

- [ES7 Decorator 装饰者模式](http://taobaofed.org/blog/2015/11/16/es7-decorator/) 玄农
- [细说 ES7 JavaScript Decorators](https://www.cnblogs.com/whitewolf/p/details-of-ES7-JavaScript-Decorators.html) 破狼
- [修饰器](http://es6.ruanyifeng.com/#docs/decorator) 阮一峰 《ECMAScript 6 入门》
- [面向对象编程](https://www.liaoxuefeng.com/wiki/001434446689867b27157e896e74d51a89c25cc8b43bdb3000/001434499763408e24c210985d34edcabbca944b4239e20000) 廖雪峰 JavaScript 教程

## ES7 修饰器模式

通过修饰器在不影响原有接口的功能上扩展新功能，以钢铁侠示例，首选创建 `Man` 类：

```js
class Man {
  constructor(def = 2, atk = 3, hp = 3) {
    this.init(def, atk, hp);
  }

  init(def, atk, hp) {
    this.def = def; // 防御值
    this.atk = atk; // 攻击力
    this.hp = hp; // 血量
  }

  toString() {
    return `防御力:${this.def},攻击力:${this.atk},血量:${this.hp}`;
  }
}

var tony = new Man();

// 输出：当前状态 ===> 防御力:2,攻击力:3,血量:3
console.log(`当前状态 ===> ${tony}`);
```

### 修饰方法

创建 `decorateArmour` 方法，为钢铁侠装配盔甲：

```js
function decorateArmour(target, key, descriptor) {
  const method = descriptor.value;
  let moreDef = 100;
  let ret;
  descriptor.value = (...args) => {
    args[0] += moreDef;
    ret = method.apply(target, args);
    return ret;
  };
  return descriptor;
}

class Man {
  // ...
  @decorateArmour
  init() {
    // ...
  }
}

var tony = new Man();

// 输出：当前状态 ===> 防御力:102,攻击力:3,血量:3
console.log(`当前状态 ===> ${tony}`);
```

- `Decorators` 的本质是 ES5 的 `Object.defineProperty` 属性
- 第一参数 `target` 是类的原型对象(此时实例还未创建)，此处 `target -> Man.prototype`
- 第二参数 `key` 是所要修饰的属性名，此处 `key === init`
- 第三参数 `descriptor` 是要修饰属性的描述对象，此处

```js
descriptor = {
  value: [Function], // -> init
  writable: true,
  enumerable: false,
  configurable: true,
};
```

修饰器的本意是要“修饰”类的实例，但此时实例还没生成，所以只能去修饰原型。上面 `decorateArmour` 在定义 `Man` 时即执行，但对 `init` 方法的修饰则在 `init` 调用时生效。上例中，通过 `descriptor.value` 改写原 `init` 方法，使得原方法在调用时 (`method.apply`) 第一入参 `args[0] += moreDef`。

### 修饰类

创建 `addFly` 方法，为钢铁侠增加“飞行”能力：

```js
function addFly(canFly) {
  return function(target) {
    target.canFly = canFly;
    let extra = canFly ? '(技能加成:飞行能力)' : '';
    let method = target.prototype.toString;
    target.prototype.toString = (...args) => {
      return method.apply(target.prototype, args) + extra;
    };
    return target;
  };
}

@addFly(true)
class Man {
  // ...
}

// 输出：当前状态 ===> 防御力:102,攻击力:3,血量:3(技能加成:飞行能力)
console.log(`当前状态 ===> ${tony}`);
```

作用在方法上的 decorator 接收的第一个参数 `target` 是类的 `prototype`，作用在类上的 decorator 接收到的第一个参数 `target` 是类本身。上例中 `addFly` 实际上是个工厂方法，返回的方法作为 decorator。`target.canFly` 为 `Man` 类添加了 `canFly` 静态属性，`target.prototype.toString` 改写了原型上的 `toStrign` 方法。

> 修饰器对类的行为的改变，是代码编译时发生的，而不是在运行时。这意味着，修饰器能在编译阶段运行代码。

### ES5 实现

```js
// 首先创建一个基类
function Man() {
  this.def = 2;
  this.atk = 3;
  this.hp = 3;
}

// 定义 Man 的接口方法 (装饰者也需要实现)
Man.prototype = {
  toString: function() {
    return `防御力:${this.def},攻击力:${this.atk},血量:${this.hp}`;
  },
};

// 创建装饰器 接收 Man 对象作为参数
var Decorator = function(man) {
  this.man = man;
};

// 装饰器要实现 Man 的接口方法
Decorator.prototype.toString = function() {
  return this.man.toString();
};

// 创建具体的装饰器
var DecorateArmour = function(man) {
  var moreDef = 100;
  man.def += moreDef;
  Decorator.call(this, man);
};

// 继承自装饰器对象
DecorateArmour.prototype = new Decorator();

// 注意这里的调用方式
var tony = new Man();
tony = new DecorateArmour(tony);

// 输出：当前状态 ===> 防御力:102,攻击力:3,血量:3
console.log(`当前状态 ===> ${tony}`);
```

## JS 面向对象(ES5)

- JS 不区分类和实例的概念，而是通过原型（prototype）来实现面向对象编程 `obj.__proto__ = Obj`。

```js
var Student = {
  name: 'Robot',
  height: 1.2,
  run: function() {
    console.log(this.name + ' is running...');
  },
};

var xiaoming = {
  name: '小明',
};

xiaoming.__proto__ = Student;
```

- 访问一个对象的属性时，JS 引擎自下往上查找属性。

```js
// arr --> Array.prototype --> Object.prototype --> null
var arr = [1, 2, 3];
```

- 构造函数，使用 `new` 返回 `this`，不使用 `new` 返回 `undefined`。

```js
function Student(name) {
  this.name = name;
  this.hello = function() {
    alert('Hello, ' + this.name + '!');
  };
}
```

- 使用 `new` 的同时对象获得 `constructor` 属性。

```js
new Student().constructor === Student.prototype.constructor;
```

- 借助空函数的继承实现

```js
function Base(props) {
  this.a = props.a;
}

function Sub(props) {
  Base.call(this, props);
  this.b = props.b;
}

function F() {}

F.prototype = Base.prototype;
Sub.prototype = new F();
Sub.prototype.constructor = Sub;

// sub --> Sub.prototype --> Base.prototype --> Object.prototype --> null
var sub = new Sub({ a: 1, b: 2 });
```

## 关于 `Object.defineProperty`

> The `Object.defineProperty()` method defines a new property directly on an object, or modifies an exisiting property on an object, and returns the object.

```js
Object.defineProperty(obj, prop, descriptor);
```

- `obj` The object on which to define the property.
- `prop` The name of the property to be defined or modified.
- `descriptor` The descriptor for the property being defined or modified.
  - `configurable` 是否可删除目标属性或修改属性以下特性 (`writable`|`configurable`|`enumerable`)
  - `enumerable` 是否能在 `for-in` 循环中遍历出来或在 `Object.keys` 中列举出来
  - `value`
  - `get`
  - `set`
- `return` The object that was passed to the function.

上面不想翻译了，详见 [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 。

借助 `Object.defineProperty` 的一个伪的双向绑定实现：

```js
const inputDOM = document.createElement('input');
const input = {};

Object.defineProperty(inputDOM, '_value', {
  set: function(val) {
    if (this.value !== val) this.value = val;
    if (input.value !== val) input._value = val;
  },
});

Object.defineProperty(input, '_value', {
  set: function(val) {
    if (this.value !== val) this.value = val;
    if (inputDOM.value !== val) inputDOM.value = val;
  },
});

inputDOM.addEventListener('change', function(e) {
  inputDOM._value = e.target.value;
});

document.body.appendChild(inputDOM);
```
