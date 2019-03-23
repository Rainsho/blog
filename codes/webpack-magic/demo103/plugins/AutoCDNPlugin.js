const { resolve } = require('path');
const { writeFileSync } = require('fs');

module.exports = class AutoCDNPlugin {
  constructor(mods) {
    this.mods = mods || {};
  }

  apply(compiler) {
    compiler.hooks.environment.tap('AutoCDNPlugin', () => {
      /**
       * { lodash: { var: '_', url: 'https://cdn.jsdelivr.net/...' } }
       *     ↓
       * { lodash: '_' }
       */
      const cdnModules = Object.keys(this.mods).reduce(
        (acc, mod) => ({ ...acc, [mod]: this.mods[mod].var }),
        {}
      );
      const { externals } = compiler.options;

      compiler.options.externals = Object.assign({}, externals, cdnModules);
    });

    compiler.hooks.done.tap('AutoCDNPlugin', stats => {
      const { path } = compiler.options.output;
      const { assets } = stats.compilation;
      const htmlFile = Object.keys(assets).find(x => /\.html$/.exec(x));

      const links = Object.keys(this.mods)
        .map(mod => this.mods[mod].url)
        .map(url => `<script src="${url}"></script>`);

      const html = assets[htmlFile]
        .source()
        .replace(/<head>([\s\S]*?)<\/head>/, (match, p) => match.replace(p, p + links.join('\n')));

      writeFileSync(resolve(path, htmlFile), html, 'utf-8');
    });
  }
};
