'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      popup: PATHS.src + '/popup.js',
      contentScript: PATHS.src + '/contentScript.js',
      background: PATHS.src + '/background.js',
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
    resolve: {
      fallback: {
        "util": require.resolve("util/"),
        "path": require.resolve("path-browserify/"),
        "fs": require.resolve("browserify-fs/"),
        "assert": require.resolve("assert/"),
        "stream": require.resolve("stream-browserify/"),
        "constants": require.resolve("constants-browserify/"),
        "zlib": require.resolve("browserify-zlib/"),
        "os": require.resolve("os-browserify/")
      }
    }
  });

module.exports = config;
