const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const vendor = ['react', 'react-dom', 'lodash'];

module.exports = {
  mode: 'development',
  entry: { vendor },
  output: {
    path: resolve(__dirname, '../dist'),
    filename: '[name]_[hash:7].js',
    library: '[name]_[hash:7]',
  },
  devtool: false, // 关闭 source-map 方便阅读构建直出的代码
  plugins: [
    new webpack.DllPlugin({
      name: '[name]_[hash:7]',
      path: resolve(__dirname, '../dist/manifest.json'),
    }),
    new HtmlWebpackPlugin({
      title: 'webpack demo',
      filename: resolve(__dirname, '../dist/index.html.temp'),
    }),
  ],
};
