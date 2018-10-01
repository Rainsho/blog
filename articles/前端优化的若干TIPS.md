# 前端优化的若干 TIPS

前端优化是一个很大的话题，感觉一时半会还很难进行一个系统的总结。借由之前之前专程做过一段时间的优化，抽一下比较有用的 TIPS 在这里做一记录。照例，列一些值得一读的文章或者手册：

- [网站性能优化实战——从 12.67s 到 1.06s 的故事](http://imweb.io/topic/5b6fd3c13cb5a02f33c013bd) 一个 95 后小孩的总结，感觉知识面很全面
- [关键渲染路径](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/?hl=zh-cn) 感觉是 Google Web Fundamentals 最热的一个部分
- [Life of a Pixel](https://www.youtube.com/watch?v=w8lm4GV7ahg) 没有熟肉的 Chromium 教学视频，主要讲 DOM 是如何呈现的
- [渲染性能](https://developers.google.com/web/fundamentals/performance/rendering/?hl=zh-cn) Google Web Fundamentals 像素管道及渲染优化

## 1. 网络传输

还是那个老生常谈的问题：「从输入 URL 到页面加载发生了什么」

![navigation timing](./assets/navigation-timing.png)

> 览器在得到用户请求之后，经历了下面这些阶段：重定向 → 拉取缓存 → DNS 查询 → 建立 TCP 链接 → 发起请求 → 接收响应 → 处理 HTML 元素 → 元素加载完成

- 1.1 缓存

  查询本地缓存文件 → 检验是否过期(Expires?) → 检验是否修改(Etag?)

  - Etag 告知将缓存写入硬盘，区别 `from memory cache` or `from disk cache`
  - 304 说明浏览器是有向服务器发起验证请求，区别 200 ↑

- 1.2 资源压缩

  Webpack(4) 一些常规操作，后面抽时间做个自己工程化的优化总结。

  - `optimization.minimizer`
  - `splitChunks.cacheGroups`
  - `html-webpack-plugin`
  - `mini-css-extract-plugin`
  - `cssnano`
  - `webpack-spritesmith`

## 2. 页面渲染

在渲染引擎(Blink、Webkit、Gecko)包括 HTML 解释器、CSS 解释器和 JS 解释器。由于 JS 的重要性后独立出单独的 JS 引擎(V8)。

- 2.1 渲染过程

  字节 → 字符 → 令牌 → 节点 → 对象模型

  - 转换：HTML 原始字节 → 指定编码的字符
  - 令牌化：字符 → `<html>`
  - 词法分析
  - DOM | CSSOM 构建
  - 合并渲染树
  - 布局计算大小和位置
  - 绘制

- 2.2 DOM 渲染与 GPU 加速

  页面由多个 DOM 元素渲染层(Layers)组成，大致渲染流程：

  - 根据样式分割独立渲染层
  - CPU 对每层进行绘制
  - 位图作为纹理交由 GPU 绘制
  - GPU 缓存并符合图像 (栅格化)

## 3. 负载

神仙打架，看看就好。

- Node.js 中间层处 IO 密集型请求
- pm2 实现「多线程」 `pm2 start app.js -i max`
