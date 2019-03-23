const { getType } = require('mime');

module.exports = function(content) {
  const type = getType(this.resourcePath);
  const data = content.toString('base64');

  return `export default ${JSON.stringify(`data:${type};base64,${data}`)}`;
};

module.exports.raw = true;
