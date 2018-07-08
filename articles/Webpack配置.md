# Webpack 配置

Webpack 的一些常用不常用的配置及插件，参考：

- [webpack-demos](https://github.com/ruanyf/webpack-demos)
- [dive-into-webpack](https://github.com/gwuhaolin/dive-into-webpack/)

## Webpack

- 同构应用(服务侧)

  ```js
  module.exports = {
    // 为了不打包进 Nodejs 内置的模块，例如 fs net 模块等
    target: 'node',
    output: {
      // 为了以 CommonJS2 规范导出渲染函数，以给采用 Nodejs 编写的 HTTP 服务调用
      libraryTarget: 'commonjs2',
    },
    module: {
      rules: [
        {
          // CSS 代码不能被打包进用于服务端的代码中去，忽略掉 CSS 文件
          test: /\.css/,
          use: ['ignore-loader'],
        },
      ],
    },
  };
  ```

- 构建 NPM 库

  ```js
  module.exports = {
    output: {
      // 输出文件的名称
      filename: 'index.js',
      // 输出文件的存放目录
      path: path.resolve(__dirname, 'lib'),
      // 输出的代码符合 CommonJS 模块化规范，以供给其它模块导入使用。
      libraryTarget: 'commonjs2',
    },
    // 通过正则命中所有以 react 或者 babel-runtime 开头的模块
    // 这些模块使用外部的，不能被打包进输出的代码里
    externals: /^(react|babel-runtime)/,
  };
  ```

- Source Map

  > - eval：用 eval 语句包裹需要安装的模块；
  > - source-map：生成独立的 Source Map 文件；
  > - hidden：不在 JavaScript 文件中指出 Source Map 文件所在，这样浏览器就不会自动加载 Source Map；
  > - inline：把生成的 Source Map 转换成 base64 格式内嵌在 JavaScript 文件中；
  > - cheap：生成的 Source Map 中不会包含列信息，这样计算量更小，输出的 Source Map 文件更小；同时 Loader 输出的 Source Map 不会被采用；
  > - module：来自 Loader 的 Source Map 被简单处理成每行一个模块；

- 减少搜索

  ```js
  module.exports = {
    resolve：{
      // 使用绝对路径指明第三方模块存放的位置，以减少搜索步骤
      modules: [path.resolve(__dirname, 'node_modules')],
      // 只采用 main 字段作为入口文件描述字段，以减少搜索步骤
      mainFields: ['main'],
      // 使用 alias 把导入 react 的语句换成直接使用单独完整的 react.min.js 文件，减少耗时的递归解析操作
      alias: {
        'react': path.resolve(__dirname, './node_modules/react/dist/react.min.js'),
        'react-dom': path.resolve(__dirname, './node_modules/react-dom/dist/react-dom.min.js'),
      },
      // 尽可能的减少后缀尝试的可能性
      extensions: ['js'],
    }
  }
  ```

- 自动刷新

  ```js
  module.export = {
    // 只有在开启监听模式时，watchOptions 才有意义
    // 默认为 false，也就是不开启
    watch: true,
    // 监听模式运行时的参数
    // 在开启监听模式时，才有意义
    watchOptions: {
      // 不监听的文件或文件夹，支持正则匹配
      // 默认为空
      ignored: /node_modules/,
      // 监听到变化发生后会等300ms再去执行动作，防止文件更新太快导致重新编译频率太高
      // 默认为 300ms
      aggregateTimeout: 300,
      // 判断文件是否发生变化是通过不停的去询问系统指定文件有没有变化实现的
      // 默认每秒问 1000 次
      poll: 1000,
    },
  };
  ```

  > 在使用 webpack-dev-server 模块去启动 webpack 模块时，webpack 模块的监听模式默认会被开启。 webpack 模块会在文件发生变化时告诉 webpack-dev-server 模块。

  DevServer 为每个 Chunk 注入代理客户端，可使用 `webpack-dev-server --inline false` 关闭，同过 `<script>` 注入 `http://localhost:8080/webpack-dev-server/`。

- Tree Shaking

  `.babelrc` 设置：

  ```json
  {
    "presets": [
      [
        "env",
        {
          "modules": false
        }
      ]
    ]
  }
  ```

  `webpack.config.js` 设置：

  ```js
  module.exports = {
    resolve: {
      // 针对 Npm 中的第三方模块优先采用 jsnext:main 中指向的 ES6 模块化语法的文件
      mainFields: ['jsnext:main', 'browser', 'main'],
    },
  };
  ```

- 按需加载(以 ReactRouter 示例)

  `webpack.config.js` 设置：

  ```js
  module.exports = {
    // JS 执行入口文件
    entry: {
      main: './main.js',
    },
    output: {
      // 为从 entry 中配置生成的 Chunk 配置输出文件的名称
      filename: '[name].js',
      // 为动态加载的 Chunk 配置输出文件的名称
      chunkFilename: '[name].js',
      path: path.resolve(__dirname, './dist'),
    },
  };
  ```

  入口代码：

  ```js
  /**
   * 异步加载组件
   * @param load 组件加载函数，load 函数会返回一个 Promise，在文件加载完成时 resolve
   * @returns {AsyncComponent} 返回一个高阶组件用于封装需要异步加载的组件
   */
  const getAsyncComponent = load =>
    class AsyncComponent extends PureComponent {
      componentDidMount() {
        // 在高阶组件 DidMount 时才去执行网络加载步骤
        load().then(({ default: component }) => {
          // 代码加载成功，获取到了代码导出的值，调用 setState 通知高阶组件重新渲染子组件
          this.setState({ component });
        });
      }

      render() {
        const { component } = this.state || {};
        // component 是 React.Component 类型，需要通过 React.createElement 生产一个组件实例
        return component ? createElement(component) : null;
      }
    };

  const App = () => (
    <HashRouter>
      <Route exact path="/" component={PageHome} />
      <Route
        path="/about"
        component={getAsyncComponent(
          // 异步加载函数，异步地加载 PageAbout 组件
          () => import(/* webpackChunkName: 'page-about' */ './pages/about')
        )}
      />
      <Route
        path="/login"
        component={getAsyncComponent(
          // 异步加载函数，异步地加载 PageAbout 组件
          () => import(/* webpackChunkName: 'page-login' */ './pages/login')
        )}
      />
    </HashRouter>
  );
  ```

  `.babelrc` 对 `import` 的支持：

  ```json
  {
    "presets": ["env", "react"],
    "plugins": ["syntax-dynamic-import"]
  }
  ```

- 输出分析

  ```bash
  $ webpack --profile --json > stats.json
  ```

  `--profile` 记录下构建过程中的耗时信息，`--json` 以 JSON 的格式输出构建结果。

  `stats.json` -> [Webpack Analyse](http://webpack.github.io/analyse/) || `webpack-bundle-analyzer`

## Loader

- `babel-loader`
  - `babel-loader?cacheDirectory`
- `css-loader`
  - `css-loader?modules` 将非 `:global(.h2)` 的类选择器转化为 hash?
  - `css-loader?minimize` 压缩 css
- `awesome-typescript-loader`
- `ignore-loader`
- `file-loader`
- `url-loader`
  - `limit` -> base64
  - `fallback` -> `file-loader`
- `raw-loader` -> svg 文本
- `svg-inline-loader` svg 压缩

-  编写 Loader

  > 在你开发一个 Loader 时，请保持其职责的单一性，你只需关心输入和输出。

  ```js
  function replace(source) {
    // 使用正则把 // @require '../style/index.css' 转换成 require('../style/index.css');
    return source.replace(/(\/\/ *@require) +(('|").+('|")).*/, 'require($2);');
  }

  module.exports = function(content) {
    return replace(content);
  };
  ```

  ```js
  module.exports = {
    resolveLoader: {
      // 去哪些目录下寻找 Loader，有先后顺序之分
      modules: ['node_modules', './loaders/'],
    },
  };
  ```

````
## Plugin

- `extract-text-webpack-plugin`

  抽取 css。

  ```js
  module.exports = {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            use: ['css-loader'],
          }),
        },
      ],
    },
    plugins: [
      new ExtractTextPlugin({
        filename: '[name]_[contenthash:8].css',
      }),
    ],
  };
````

- `webpack/lib/optimize/UglifyJsPlugin`

  压缩 JS。

  ```js
  new UglifyJsPlugin({
    // 最紧凑的输出
    beautify: false,
    // 删除所有的注释
    comments: false,
    compress: {
      // 在UglifyJs删除没有用到的代码时不输出警告
      warnings: false,
      // 删除所有的 `console` 语句，可以兼容ie浏览器
      drop_console: true,
      // 内嵌定义了但是只用到一次的变量
      collapse_vars: true,
      // 提取出出现多次但是没有定义成变量去引用的静态值
      reduce_vars: true,
    },
  });
  ```

- `webpack/lib/DefinePlugin`

  定义环境变量。

  ```js
  new DefinePlugin({
    // 定义 NODE_ENV 环境变量为 production 去除 react 代码中的开发时才需要的部分
    'process.env': {
      NODE_ENV: JSON.stringify('production'),
    },
  });
  ```

- `web-webpack-plugin` - `WebPlugin`

  生成模板 html。

  ```js
  new WebPlugin({
    template: './template.html', // HTML 模版文件所在的文件路径
    filename: 'index.html', // 输出的 HTML 的文件名称
  });
  ```

- `web-webpack-plugin` - `AutoWebPlugin`

  自动查找 chunk。

  ```js
  const autoWebPlugin = new AutoWebPlugin('pages', {
    template: './template.html', // HTML 模版文件所在的文件路径
    postEntrys: ['./common.css'], // 所有页面都依赖这份通用的 CSS 样式文件
    // 提取出所有页面公共的代码
    commonsChunk: {
      name: 'common', // 提取出公共代码 Chunk 的名称
    },
  });

  module.exports = {
    entry: autoWebPlugin.entry({
      // 这里可以加入你额外需要的 Chunk 入口
    }),
    plugins: [autoWebPlugin],
  };
  ```

- `serviceworker-webpack-plugin`

  构建离线应用。

- `webpack/lib/DllPlugin` + `webpack/lib/DllReferencePlugin`

      	动态引用。

  ```js
  new DllPlugin({
    // 动态链接库的全局变量名称，需要和 output.library 中保持一致
    // 该字段的值也就是输出的 manifest.json 文件 中 name 字段的值
    // 例如 react.manifest.json 中就有 "name": "_dll_react"
    name: '_dll_[name]',
    // 描述动态链接库的 manifest.json 文件输出时的文件名称
    path: path.join(__dirname, 'dist', '[name].manifest.json'),
  });

  new DllReferencePlugin({
    // 描述 react 动态链接库的文件内容
    manifest: require('./dist/react.manifest.json'),
  });
  new DllReferencePlugin({
    // 描述 polyfill 动态链接库的文件内容
    manifest: require('./dist/polyfill.manifest.json'),
  });
  ```

- `happypack`

  > 由于 JavaScript 是单线程模型，要想发挥多核 CPU 的能力，只能通过多进程去实现，而无法通过多线程实现。

  ```js
  const rule = {
    // 把对 .css 文件的处理转交给 id 为 css 的 HappyPack 实例
    test: /\.css$/,
    use: ExtractTextPlugin.extract({
      use: ['happypack/loader?id=css'],
    }),
  };

  new HappyPack({
    id: 'css',
    // 如何处理 .css 文件，用法和 Loader 配置中一样
    loaders: ['css-loader'],
  });
  ```

- `webpack-parallel-uglify-plugin`

  多线程压缩。

  ```js
  new ParallelUglifyPlugin({
    // 缓存压缩后的结果，下次遇到一样的输入时直接从缓存中获取压缩后的结果返回
    // cacheDir 用于配置缓存存放的目录路径
    cacheDir: '.uglify-cache',
    uglifyJS: {
      output: {
        beautify: false,
        comments: false,
      },
      compress: {
        warnings: false,
        drop_console: true,
        collapse_vars: true,
        reduce_vars: true,
      },
    },
  });
  ```

- `uglifyjs-webpack-plugin`

  压缩 ES6。

- `webpack/lib/optimize/CommonsChunkPlugin`

  抽取公共代码。

  ```js
  // 为了从 common 中提取出 base 也包含的部分
  new CommonsChunkPlugin({
    // 从 common 和 base 两个现成的 Chunk 中提取公共的部分
    chunks: ['common', 'base'],
    // 把公共的部分放到 base 中
    name: 'base',
  });
  ```

- `prepack-webpack-plugin`

  优化代码在运行时的效率。

  > 实际上 Prepack 就是一个部分求值器，编译代码时提前将计算结果放到编译后的代码中，而不是在代码运行时才去求值。

- `webpack/lib/optimize/ModuleConcatenationPlugin`

  作用域提升。

- `webpack-bundle-analyzer`

  输出分析。

- 编写 Plugin

  > Compiler 和 Compilation 的区别在于：Compiler 代表了整个 Webpack 从启动到关闭的生命周期，而 Compilation 只是代表了一次新的编译。

  > Webpack 就像一条生产线，要经过一系列处理流程后才能将源文件转换成输出结果。 这条生产线上的每个处理流程的职责都是单一的，多个流程之间有存在依赖关系，只有完成当前处理后才能交给下一个流程去处理。 插件就像是一个插入到生产线中的一个功能，在特定的时机对生产线上的资源做处理。

  ```js
  class EndWebpackPlugin {
    constructor(doneCallback, failCallback) {
      // 存下在构造函数中传入的回调函数
      this.doneCallback = doneCallback;
      this.failCallback = failCallback;
    }

    apply(compiler) {
      compiler.plugin('done', stats => {
        // 在 done 事件中回调 doneCallback
        this.doneCallback(stats);
      });
      compiler.plugin('failed', err => {
        // 在 failed 事件中回调 failCallback
        this.failCallback(err);
      });
    }
  }
  // 导出插件
  module.exports = EndWebpackPlugin;
  ```

## Server

- `DevServer` = `express` + `webpack-dev-middleware`

  ```js
  // server.js
  const express = require('express');
  const webpack = require('webpack');
  const webpackMiddleware = require('webpack-dev-middleware');

  // 从 webpack.config.js 文件中读取 Webpack 配置
  const config = require('./webpack.config.js');
  // 实例化一个 Expressjs app
  const app = express();

  // 用读取到的 Webpack 配置实例化一个 Compiler
  const compiler = webpack(config);
  // 给 app 注册 webpackMiddleware 中间件
  app.use(webpackMiddleware(compiler));
  // 为了支持模块热替换
  app.use(require('webpack-hot-middleware')(compiler));
  // 把项目根目录作为静态资源目录，用于服务 HTML 文件
  app.use(express.static('.'));
  // 启动 HTTP 服务器，监听在 3000 端口
  app.listen(3000, () => {
    console.info('成功监听在 3000');
  });
  ```

  ```js
  // main.js
  // 为了支持模块热替换
  if (module.hot) {
    module.hot.accept();
  }
  ```
