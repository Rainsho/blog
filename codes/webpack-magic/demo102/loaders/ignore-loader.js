const { getOptions, interpolateName } = require('loader-utils');

module.exports = function(content) {
  const options = getOptions(this);
  const fileName = interpolateName(this, '[name]_[hash:7].[ext]', { content });

  console.log('-------- in loader --------');
  console.log(options);
  console.log(fileName);

  return '// clear by ignore-loader';
};
