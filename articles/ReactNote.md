# React Note

[原文：React入门教程](https://hulufei.gitbooks.io/react-tutorial/content/index.html)

React 包含
* 组件
* JSX
* Virtual DOM
* Data Flow

**JSX** 使JS支持嵌入HTML，使前端实现组件化  
**Virtual DOM**  
1. 组件 `state` 改变，调用 `render` 重新渲染 UI
2. 实现 diff 算法仅更新改变 DOM
3. 纯粹的 JS 数据结构

> Babel 编译， Webpack 打包，构建开发环境

## JSX

JS 的写法
```javascript
React.createElement('a', {href: 'http://facebook.github.io/react/'}, 'Hello!');

var child = React.createElement('li', null, 'Text Content');
var root = React.createElement('ul', { className: 'my-list' }, child);
React.render(root, document.body);
```

### 使用 JSX

```javascript
// 子组件也可以作为表达式使用
var content = <Container>{window.isLoggedIn ? <Nav /> : <Login />}</Container>;

// 注释
{/* child comment, put {} around */}
```

**HTML 转义**，防止 XSS  
* 直接使用 UTF-8 字符
* 使用对应字符的 Unicode 编码
* 使用数组组装 `<div>{['cc ', <span>&copy;</span>, ' 2015']}</div>`
* 直接插入原始的 HTML `<div dangerouslySetInnerHTML={{__html: 'cc &copy; 2015'}} />`

自定义 HTML 属性  
> 如果在 JSX 中使用的属性不存在于 HTML 的规范中，这个属性会被忽略。如果要使用自定义属性，可以用 data- 前缀  
可访问性属性的前缀 aria- 也是支持的

### 属性扩散

_spread attributes_
```javascript
var props = { };
props.foo = x;
props.bar = y;
var component = <Component {...props} foo={'override'} />;
```

## 组件

**props**  
> props 就是组件的属性，由外部通过 JSX 属性传入设置，一旦初始设置完成，就可以认为 this.props 是不可更改的，所以不要轻易更改设置 this.props 里面的值

**state**
> state 是组件的当前状态，可以把组件简单看成一个“状态机”，根据状态 state 呈现不同的 UI 展示。
一旦状态（数据）更改，组件就会自动调用 render 重新渲染 UI，这个更改的动作会通过 this.setState 方法来触发

**划分状态数据**  
> 下面这些可以认为不是**状态**：  
* 可计算的数据：比如一个数组的长度
* 和 props 重复的数据：除非这个数据是要做变更的

**无状态组件**  
开销很低，如果可能的话尽量使用无状态组件
```javascript
const HelloMessage = (props) => <div> Hello {props.name}</div>;
render(<HelloMessage name="John" />, mountNode);
```

### 组件生命周期

组件类由 `extends Component` 创建

#### `getInitialState`
初始化 this.state 的值，只在组件装载之前调用一次。  
如果是使用 ES6 的语法，你也可以在构造函数中初始化状态，比如：
```javascript
class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = { count: props.initialCount };
  }

  render() {
    // ...
  }
}
```

#### `getDefaultProps`
只在组件创建时调用一次并缓存返回的对象（即在 `React.createClass` 之后就会调用）。  
因为这个方法在实例初始化之前调用，所以在这个方法里面不能依赖 `this` 获取到这个组件的实例。  
保证没有传值时，对应属性也总是有值的。  
ES6 语法，可以直接定义 `defaultProps` 这个类属性来替代：
```javascript
Counter.defaultProps = { initialCount: 0 };
```

#### `render`
**必须**，可返回 `null` 或者 `false`  
这时候 `ReactDOM.findDOMNode(this)` 会返回 `null`

#### 生命周期函数
* `componentWillMount`
* `componentDidMount`
  * 从这里开始，可以通过 `ReactDOM.findDOMNode(this)` 获取到组件的 DOM 节点
* `componentWillReceiveProps`
* `shouldComponentUpdate`
* `componentWillUpdate`
* `componentDidUpdate`
* `componentWillUnmount`

### 事件处理

React 里面绑定事件的方式和在 HTML 中绑定事件类似，注意要显式调用 `bind(this)` 将事件函数上下文绑定要组件实例上。  
**传递参数** `bind(this, arg1, arg2, ...)`

#### “合成事件”和“原生事件”
> React 实现了一个“合成事件”层（synthetic event system），这个事件模型保证了和 W3C 标准保持一致  
**事件委托** “合成事件”会以事件委托（event delegation）的方式绑定到组件最上层，并且在组件卸载（unmount）的时候自动销毁绑定的事件  
**原生事件** 比如在 `componentDidMount` 方法里面通过 `addEventListener` 绑定的事件就是浏览器原生事件  
“合成事件”的 `event` 对象只在当前 event loop 有效，比如你想在事件里面调用一个 promise，在 resolve 之后去拿 `event` 对象会拿不到

### DOM 操作

#### findDOMNode()

组件加载后，可以通过 `findDOMNode()` 拿到有状态的组件，无状态的组件返回 `null`

```javascript
import { findDOMNode } from 'react-dom';

componentDidMound() {
  const el = findDOMNode(this);
}
```

#### Refs

场景：清空一个 `<input/>` 时 focus ，无法通过 `state` 实现

`ref` 设置在原生 HTML 上，它拿到的就是 DOM 元素，如果设置在自定义组件上，它拿到的就是组件实例

### 组合组件

> 如果组件中包含通过循环插入的子元素，为了保证重新渲染 UI 的时候能够正确显示这些子元素，每个元素都需要通过一个特殊的 `key` 属性指定一个唯一值。为了内部 diff 的效率。

> 组件标签里面包含的子元素会通过 `props.children` 传递进来。

### 组件间通信

子组件通过 `props` 属性访问父组件传递的数据/方法。父组件通过 `refs` 访问子组件。

```javascript
import React, { Component } from 'react';
import { render } from 'react-dom';

class GroceryList extends Component {
  handleClick(i) {
    console.log('You clicked: ' + this.props.items[i]);
  }

  render() {
    return (
      <div>
        {this.props.items.map((item, i) => {
          return (
            <div onClick={this.handleClick.bind(this, i)} key={i}>{item}</div>
          );
        })}
      </div>
    );
  }
}

render(
  <GroceryList items={['Apple', 'Banana', 'Cranberry']} />, mountNode
);
```

#### 非父子组件通信

> 使用全局事件 Pub/Sub 模式，在 `componentDidMount` 里面订阅事件，在 `componentWillUnmount` 里面取消订阅，当收到事件触发的时候调用 `setState` 更新 UI。  
这种模式在复杂的系统里面可能会变得难以维护，所以看个人权衡是否将组件封装到大的组件，甚至整个页面或者应用就封装到一个组件。  
一般来说，对于比较复杂的应用，推荐使用类似 Flux 这种单项数据流架构，参见Data Flow。

## Data Flow

### Flux

React 相当于 V， Flux 相当于 M 和 C。

> 一个 Flux 应用包含四个部分：
* the dispatcher  
处理动作分发，维护 Store 之间的依赖关系
* the stores  
数据和逻辑部分
* the views  
React 组件，这一层可以看作 controller-views，作为视图同时响应用户交互
* the actions  
提供给 dispatcher 传递数据给 store

Flux 核心**单向数据流**

> Action -> Dispatcher -> Store -> View

![flux-overview](pic/flux-overview.png)

简单流程：
* 定义 action creator 创建 Action 给 dispatcher
* View 层通过交互触发 Action
* Store 回调函数接收 Action 更新后数据触发 change 事件通知 View
* View 监听 change 事件，拿到新数据并 `setState` 更新 UI

状态由 Store 维护，通过 Action 传递数据，构成单向数据流循环。

dispatcher 作为粘合剂，剩余的 Store、View、Action 需要按具体需求实现。

Action 通过定义一些 action creator 方法来创建，这些方法用来暴露给外部调用，通过 dispatch 分发对应的动作。所谓动作就是用来封装传递数据的，动作只是一个简单的对象，包含两部分：payload（数据）和 type（类型），type 是一个字符串常量，用来标识动作。

Stores 包含应用的状态和逻辑，不同的 Store 管理应用中不同部分的状态。

View 就是 React 组件，从 Store 获取状态（数据），绑定 change 事件处理。

**...再往后的看不懂了，暂时放一下**

### Redux

一个**可预测的状态容器**

> (oldState, action) => newState

Redux 将 Store 简化成一个**pure function**（不会影响任何外部状态）： `(state, action) => state`

```javascript
const initialState = { todos: [] };
export default function TodoStore(state = initialState, action) {
  switch (action.type) {
  case ActionTypes.ADD_TODO:
    return { todos: state.todos.concat([action.text]) };
  default:
    return state;
}
```

> Redux 基本原则：
* 整个应用只有唯一一个可信数据源，也就是只有一个 Store
* State 只能通过触发 Action 来更改
* State 的更改必须写成纯函数，也就是每次更改总是返回一个新的 State，在 Redux 里这种函数称为 Reducer

`store.dispatch(action) -> reducer(state, action) -> store.getState()` 其实就构成了一个“单向数据流”。

1. 调用 `store.dispatch(action)`  
Action 是一个包含 { type, payload } 的对象，它描述了“发生了什么”，比如：  
```javascript
{ type: 'LIKE_ARTICLE', articleID: 42 }
{ type: 'FETCH_USER_SUCCESS', response: { id: 3, name: 'Mary' } }
{ type: 'ADD_TODO', text: 'Read the Redux docs.' }
```
1. Action 会触发给 Store 指定的 root reducer  
  * reducer 函数接受 (state, action) 两个参数
1. Store 会保存 root reducer 返回的状态树

## 表单

表单属性：
* `value`，对应 `<input>` 和 `<textarea>` 所有
* `checked`，对应类型为 `checkbox` 和 `radio` 的 `<input>` 所有
* `selected`，对应 `<option>` 所有

在 HTML 中 `<textarea>` 的值可以由子节点（文本）赋值，但是在 React 中，要用 `value` 来设置。

**受控组件**状态属性更改涉及 UI 的变更都由 React 来控制。**非受控组件**没有设置自己的“状态属性”，或者属性值设置为 `null`，设置默认值，使用特殊属性 `defaultValue` 和 `defaultChecked` 。

在浏览器 DOM 里面是有区分 attribute 和 property 的。attribute 是在 HTML 里指定的属性，而每个 HTML 元素在 JS 对应是一个 DOM 节点对象，这个对象拥有的属性就是 property。

在 React 里输入框的 `value` *property* 会改变，但是 `value` *attribute* 依然会是 HTML 上指定的值。

在 HTML 中 `<select>` 标签指定选中项都是通过对应 `<option>` 的 `selected` 属性来做的，但是在 React 修改成统一使用 `value`。复选 `<select multiple={true} value={['B', 'C']}>`

## 代码片段

```javascript
// todos
let todos = [];
todos = todos.concat([work1, work2, ...]);

// Reducers (pure function)
const initialState = {
  a: 'a',
  b: 'b'
};

function someApp(state = initialState, action) {
  switch (action.type) {
    case 'CHANGE_A':
      // object spread 语法 确保不会更改到 oldState 而是返回一个 newState
      return { ...state, a: 'Modified a' };
    case 'CHANGE_B':
      return { ...state, b: action.payload };
    default:
      // 对于不需要处理的 action，直接返回 oldState
      return state
  }
}
```

## 一点补充

[参考](https://blog.gmem.cc/react-study-note)

### 动画

借助 `ReactCSSTransitionGroup` 实现的动画效果。在 browser compiler 模式下，引入`react-with-addons`、`react-dom`、`react-transition-group`、`babel`

```javascript
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

render() {
  return (
    <div>
      <button onClick={this.handleAdd}>Add item</button>
      <ReactCSSTransitionGroup
          transitionName="example"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}>
          {items}
      </ReactCSSTransitionGroup>
    </div>
  )
}
```

> 1. 当条目被加入时，样式类 example-enter 被应用，紧接着 example-enter-active 则被应用
> 1. 当条目被移除时，样式类 example-leave 被应用，紧接着 example-leave-active 则被应用

或者通过 `transitionName` 自定义样式名称。

### SyntheticEvent

通过 SyntheticEvent 的 `nativeEvent` 属性，可以访问到原生浏览器事件对象。
阻止事件冒泡需显示的调用 `e.stopPropagation()` 或 `e.preventDefult()`。
由于 SyntheticEvent 是被 pooled，实例会被重用，因此不能异步使用。

### 性能优化

1. 构建

基于 create-react-app 执行 `npm run build`  
使用 Webpack 添加如下配置：

```javascript
new webpack.DefinePlugin( {
    'process.env': {
        NODE_ENV: JSON.stringify( 'production' )
    }
} ),
new webpack.optimize.UglifyJsPlugin()
```

2. Reconciliation (重渲染?)

O(n) 复杂度的 diffing algorithm 基于两个假设：

* 两个类型不同的元素类型，总是产生不同的DOM子树
* 开发者应当使用 `key` 属性对子元素进行标识

比较根元素(根元素变化整个子树重建)：

* 旧 DOM 销毁，触发 `componentWillUnmount()`
* 新 DOM 插入，新组件的 `componentWillMount()` 等依次触发
* 嵌套子 DOM / 组件被销毁或者创建

递归子节点：

在不使用 `key` 的情况下，每发现不一样的子节点，就认为其已变化。`[1, 2]` 变为 `[0, 1, 2]` 被认为是删除了两个子元素，新增了三个子元素。(且通常情况下新渲染的是元素2!)

3. 避免重渲染 `SCU`

React 创建维护虚拟 DOM，避免对 DOM 节点的不不用访问，访问 DOM 节点比 JS 对象缓慢。

4. 使用不可变数据

基于浅比较判断变化的缺点 `this.state.names.push('Alex')`，常见解决办法 `...` 或者 `assign`，引入 `Immutable.js`。

### 零散问题

> `import React from 'react';` 意味着将 react 模块的默认导出 (default export) 
导入到当前模块。但是 React 并非基于 ES6 语言编写，因此不适用默认导出。
实际上，此语法是依赖于 Babel 的支持，效果上相当于把 react 模块的 `module.exports = React;` 
直接赋值给当前模块的 React 变量。下面这种写法是等价的 `import * as React from 'react';`。
