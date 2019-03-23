const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const AutoCDNPlugin = require('./plugins/AutoCDNPlugin');

module.exports = {
  mode: 'development',
  entry: { demo103: resolve(__dirname, 'src/index.js') },
  output: {
    path: resolve(__dirname, '../dist'),
    filename: '[name].js',
  },
  devtool: false, // 关闭 source-map 方便阅读构建直出的代码
  optimization: {
    runtimeChunk: 'single', // 抽离 rumtime 到单独文件
  },
  plugins: [
    new HtmlWebpackPlugin({ title: 'webpack demo' }),
    // new AutoCDNPlugin({
    //   lodash: { var: '_', url: 'https://cdn.jsdelivr.net/npm/lodash@4.17.11/lodash.min.js' },
    // }),
  ],
};
