# 详解 webpackBootstrap

## TL;DR

1. 本文不探讨 webpack 如何配置、如何优化。
1. 本文侧重 webpack 构建后的代码(模块)如何工作，即 `import` 或 `require` 时到底发生了什么。
1. 本文主要探究 webpack `rumtime` (即 `webpackBootstrap`) 的完整调用栈。

## 简单交代背景

手上的一个项目使用 `DllPlugin` 拆分 `bundles`，每次会单独构建所谓的 DLL。该部分代码主要是一些主流的第三方库诸如 React Redux 等，同时也包含部分自研的工具库。通常都是单独构建后通过 `DllReferencePlugin` 暴露给业务代码引用。DLL 的优势和好处有兴趣的同学可执行参考[官网](https://webpack.js.org/plugins/dll-plugin/)，简单来讲通过这样的构建设计可以大幅度降低构建时间，同时 DLL 文件也可以长时间进行 CDN 缓存。

前些日子遇到这样一个优化场景，业务方希望使用 DLL 中的一小部分包(简称 A 包)，开发一个优先加载的模块 P。正常情况下只需要在 P 项目中单独引用 A 包然后正常构建即可。**但是**，不巧的是，该 A 包是进行部分初始化工作的模块，而该优先加载的模块，我们的设计目标是渐进式上线。即在正常情况下 A 包初始化的功能在业务模块内部进行，而在优化场景下需 A 包在该优先加载的(P 项目输出)模块内进行初始化操作。(balabala...，背景越写越长，但不是这次的重点，顺便提一下这个场景的实现方式就是适当的共享不同构建项目的 `rumtime`，至于为什么会可行，了解下 `rumtime` 做了什么就行了)。

## 准备环境

webpack 4 的 `rumtime` 较 webpack 3 做了很多优化，最明显的一点就是 `checkDeferredModules` 功能，会等待所有依赖的 module 加载完毕后再开始执行代码，因此不需要强行约束 chunk 代码的加载顺序。这里我们使用 webpack 4 进行示例和解读。详细代码可参见 [webpack-magic](../codes/webpack-magic)。

- 业务代码

  [./demo101/bar.js](../codes/webpack-magic/demo101/bar.js)

  ```js
  console.log("i'm in bar~");

  export default 42;
  ```

  [./demo101/foo.js](../codes/webpack-magic/demo101/foo.js)

  ```js
  import bar from './bar';

  console.log("i'm in foo~");
  console.log(`got ${bar} fron bar`);
  ```

- webpack 配置

  [./demo101/webpack.config.js](../codes/webpack-magic/demo101/webpack.config.js)

  ```js
  const { resolve } = require('path');
  const HtmlWebpackPlugin = require('html-webpack-plugin');

  module.exports = {
    mode: 'development',
    entry: { demo101: resolve(__dirname, 'foo.js') },
    output: {
      path: resolve(__dirname, '../dist'),
      filename: '[name].js',
    },
    devtool: false, // 关闭 source-map 方便阅读构建直出的代码
    optimization: {
      runtimeChunk: 'single', // 抽离 rumtime 到单独文件
    },
    plugins: [new HtmlWebpackPlugin({ title: 'demo101' })],
  };
  ```

- 执行编译

  ```bash
  cd webpack-magic
  npm i
  npm run wb101
  ```

不出意外的话即可在 `dist` 目录下看到输出的 `demo101.js` `index.html` 和 `runtime.js`。

## 初窥 runtime

## let's debugger

## what's next
