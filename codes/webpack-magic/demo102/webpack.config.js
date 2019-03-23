const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: { demo102: resolve(__dirname, 'src/index.js') },
  output: {
    path: resolve(__dirname, '../dist'),
    filename: '[name].js',
  },
  devtool: false, // 关闭 source-map 方便阅读构建直出的代码
  optimization: {
    runtimeChunk: 'single', // 抽离 rumtime 到单独文件
  },
  module: {
    rules: [
      {
        test: /\.jpg$/i,
        use: [
          // resolve(__dirname, 'loaders/ignore-loader.js'),
          resolve(__dirname, 'loaders/img-loader.js'),
        ],
      },
    ],
  },
  plugins: [new HtmlWebpackPlugin({ title: 'webpack demo' })],
};
