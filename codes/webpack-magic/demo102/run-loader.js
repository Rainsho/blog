const { resolve } = require('path');
const { runLoaders } = require('loader-runner');

runLoaders(
  {
    resource: resolve(__dirname, 'src/goose.jpg'),
    loaders: [
      resolve(__dirname, 'loaders/ignore-loader.js?foo=1&bar=2'),
      {
        loader: resolve(__dirname, 'loaders/ignore-loader.js'),
        options: { foo: 3, bar: 4 },
      },
      // resolve(__dirname, 'loaders/img-loader.js'),
    ],
  },
  (err, result) => {
    console.log('-------- in callback --------');
    err ? console.error(err) : console.log(result);
  }
);
