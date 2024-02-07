var path = require('path')
var utils = require('./utils')
var webpack = require('webpack')
var utils = require('./utils')
var config = require('../config')
var vueLoaderConfig = require('./vue-loader.conf')
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  entry: {
    style: './src/styles/'
  },
  module: {
    rules: [{
      test: /\.(ttf|eot|otf|woff2?)(\?.*)?$/,
      loader: 'file-loader',
      options: {
        name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
      }
    }]
    .concat(utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true
    })),
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: config.build.assetsPublicPath
  },
  plugins: [
    new UglifyJsPlugin({
      sourceMap: true
    }),
    // extract css into its own file
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
  ]
}
