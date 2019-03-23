const { resolve } = require('path');
const webpack = require('webpack');

const demo = process.argv[2] || 'demo101';
const config = require(resolve(__dirname, demo, 'webpack.config.js'));

webpack(config, (err, stats) => {
  if (err) throw err;

  console.log(stats.toString());
});
