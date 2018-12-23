const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: { demo101: resolve(__dirname, 'foo.js') },
  output: {
    path: resolve(__dirname, '../dist'),
    filename: '[name].js',
  },
  devtool: false,
  optimization: {
    runtimeChunk: 'single',
  },
  plugins: [new HtmlWebpackPlugin({ title: 'demo101' })],
};
