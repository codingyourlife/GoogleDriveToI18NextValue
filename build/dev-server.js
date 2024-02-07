require('./check-versions')();
var HtmlWebpackPlugin = require('html-webpack-plugin')

var config = require('../config');
Object.keys(config.dev.env).forEach((key) => {
  if (!process.env[key]) {
    process.env[key] = JSON.parse(config.dev.env[key]);
  }
});

var open; // Declare open variable
import('open').then((mod) => {
  open = mod.default;
}).catch(err => console.error('Failed to load the open module', err));

var path = require('path');
var express = require('express');
var webpack = require('webpack');
var { createProxyMiddleware } = require('http-proxy-middleware');
var webpackConfig = require('./webpack.dev.conf');

var port = process.env.PORT || config.dev.port;
var autoOpenBrowser = !!config.dev.autoOpenBrowser;
var proxyTable = config.dev.proxyTable;

var app = express();
var compiler = webpack(webpackConfig);

require('../server')(app);

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  stats: 'minimal',
});

var hotMiddleware = require('webpack-hot-middleware')(compiler);

compiler.hooks.compilation.tap('HtmlWebpackPluginAfterEmit', (compilation) => {
  HtmlWebpackPlugin.getHooks(compilation).afterEmit.tapAsync(
    'ReloadAfterHtmlWebpackPluginEmit', // <-- Give your hook a unique name
    (data, cb) => {
      hotMiddleware.publish({ action: 'reload' });
      cb();
    }
  );
});

Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context];
  if (typeof options === 'string') {
    options = { target: options };
  }
  app.use(createProxyMiddleware(context, options));
});

app.use(require('connect-history-api-fallback')());
app.use(devMiddleware);
app.use(hotMiddleware);

var staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory);
app.use(staticPath, express.static('./static'));

var uri = 'http://localhost:' + port;

console.log('> Starting dev server...');
devMiddleware.waitUntilValid(() => {
  console.log('> Listening at ' + uri + '\n');
  if (autoOpenBrowser && process.env.NODE_ENV !== 'testing') {
    open(uri);
  }
});

var server = app.listen(port);

module.exports = {
  ready: new Promise(resolve => {
    resolve();
  }),
  close: () => {
    server.close();
  },
};
