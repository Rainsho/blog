const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    demo106_A: resolve(__dirname, 'moduleA'),
    demo106_B: resolve(__dirname, 'moduleB'),
  },
  output: {
    path: resolve(__dirname, '../dist'),
    filename: '[name].js',
  },
  devtool: false, // 关闭 source-map 方便阅读构建直出的代码
  optimization: {
    runtimeChunk: 'single', // 抽离 rumtime 到单独文件
    splitChunks: {
      cacheGroups: {
        common: {
          name: 'common',
          chunks: 'all',
          minSize: 0,
          minChunks: 2,
        },
      },
    },
  },
  plugins: [new HtmlWebpackPlugin({ title: 'webpack demo' })],
};
