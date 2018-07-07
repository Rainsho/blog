# React入门

[原文：React教程](http://www.runoob.com/react/react-tutorial.html "React教程")  
[React官网](https://facebook.github.io/react/ "React官网")

[TOC]

## HelloWorld
```HTML
<div id="example"></div>
<script type="text/babel">
  ReactDOM.render(
    <h1>Hello, world!</h1>,
    document.getElementById('example')
  );
</script>
```

## 安装

* **react.min.js** - React核心库
* **react-dom.min.js** - 提供与DOM相关的功能
* **browser.min.js** - 将JSX语法转译为JS语法

> **注意：**  
使用JSX，&lt;script>标签的type="text/babel"

## React JSX
JSX优点

* 执行更快，编译为JS后进行优化
* 类型安全，编译过程能发现错误
* JSX编写模版更加简单快速

### 使用JSX
网页内或独立**JS**文件

### JS表达式
表达式写在{}内，无if else，可以使用三元运算

```JS
ReactDOM.render(
	<div>
	  <h1>{i == 1 ? 'True!' : 'False'}</h1>
	</div>
	,
	document.getElementById('example')
);
```

### 样式
推荐使用内联样式，React自动添加px

```JS
var myStyle = {
	fontSize: 100,
	color: '#FF0000'
};
ReactDOM.render(
	<h1 style = {myStyle}>菜鸟教程</h1>,
	document.getElementById('example')
);
```

### 注释

```JS
{/*注释...*/}
```

### 数组
自动展开

```JS
var arr = [
  <h1>菜鸟教程</h1>,
  <h2>学的不仅是技术，更是梦想！</h2>,
];
ReactDOM.render(
  <div>{arr}</div>,
  document.getElementById('example')
);
```

### HTML标签与React组件
**React的JSX使用大、小写的约定来区分本地组件的类和HTML标签**

```JS
// HTML标签
var myDivElement = <div className="foo" />;
// React组件
var MyComponent = React.createClass({/*...*/});
var myElement = <MyComponent someProperty={true} />;

// ReactDOM.render(...);
```

> 注意:  
由于 JSX 就是 JavaScript，一些标识符像 class 和 for 不建议作为 XML 属性名。作为替代，React DOM 使用 className 和 htmlFor 来做对应的属性。

## React组件
### 基本
```JS
var HelloMessage = React.createClass({
  render: function() {
    return <h1>Hello World！</h1>;
  }
});

ReactDOM.render(
  <HelloMessage />,
  document.getElementById('example')
);
```

> 注意，原生HTML元素名以小写字母开头，而自定义的React类名以大写字母开头，比如HelloMessage不能写成helloMessage。除此之外还需要注意组件类只能包含一个顶层标签，否则也会报错。

### 传参
```JS
  return <h1>Hello {this.props.name}</h1>;

  <HelloMessage name="World!" />,
```

> 注意，在添加属性时，class属性需要写成className，for属性需要写成htmlFor（JS的保留字）。

### 复合
```JS
var WebSite = React.createClass({
  render: function() {
    return (
      <div>
        <Name name={this.props.name} />
        <Link site={this.props.site} />
      </div>
    );
  }
});

var Name ...

var Link ...
```

## React State
React里，更新组件的state，然后根据新的state重新渲染用户界面（不要操作DOM）。

```JS
var LikeButton = React.createClass({
  getInitialState: function() {
    return {liked: false};
  },
  handleClick: function(event) {
    this.setState({liked: !this.state.liked});
  },
  render: function() {
    var text = this.state.liked ? '喜欢' : '不喜欢';
    return (
      <p onClick={this.handleClick}>
        你<b>{text}</b>我。点我切换状态。
      </p>
    );
  }
});
```

## React Props
state根据交互改变，而**props**不可变。  
你可以通过 getDefaultProps() 方法为 props 设置默认值。

```JS
var HelloMessage = React.createClass({
  getDefaultProps: function() {
    return {
      name: 'Runoob'
    };
  },
  render: function() {
    return <h1>Hello {this.props.name}</h1>;
  }
});
```

## React组件API
> * 设置状态：setState
* 替换状态：replaceState
* 设置属性：setProps
* 替换属性：replaceProps
* 强制更新：forceUpdate
* 获取DOM节点：findDOMNode
* 判断组件挂载状态：isMounted

## React组件生命周期
> * Mounting：已插入真实 DOM
* Updating：正在被重新渲染
* Unmounting：已移出真实 DOM

## React AJAX
通过componentDidMount方法中的Ajax来获取，当从服务端获取数据库可以将数据存储在state中，再用this.setState方法重新渲染UI。当使用异步加载数据时，在组件卸载前使用componentWillUnmount来取消未完成的请求。

```JS
var UserGist = React.createClass({
  getInitialState: function() {
    return {
      username: '',
      lastGistUrl: ''
    };
  },

  componentDidMount: function() {
    this.serverRequest = $.get(this.props.source, function (result) {
      var lastGist = result[0];
      this.setState({
        username: lastGist.owner.login,
        lastGistUrl: lastGist.html_url
      });
    }.bind(this));
  },

  componentWillUnmount: function() {
    this.serverRequest.abort();
  },

  render: function() {
    return (
      <div>
        {this.state.username} 用户最新的 Gist 共享地址：
        <a href={this.state.lastGistUrl}>{this.state.lastGistUrl}</a>
      </div>
    );
  }
});
```

## React表单与事件
### 简单实例
```JS
var HelloMessage = React.createClass({
  getInitialState: function() {
    return {value: 'Hello Runoob!'};
  },
  handleChange: function(event) {
    this.setState({value: event.target.value});
  },
  render: function() {
    var value = this.state.value;
    return <div>
            <input type="text" value={value} onChange={this.handleChange} />
            <h4>{value}</h4>
           </div>;
  }
});
```

## React Refs
用来绑定到render()输出的任何组件上。
