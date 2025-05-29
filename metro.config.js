// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  // Polyfill or ignore Node.js core modules
  assert: require.resolve("empty-module"),
  crypto: require.resolve("crypto-browserify"),
  http: require.resolve("empty-module"),
  https: require.resolve("empty-module"),
  os: require.resolve("empty-module"),
  stream: require.resolve("readable-stream"),
  _stream_cluster: require.resolve("empty-module"), // Specific polyfills that might be needed
  _stream_duration: require.resolve("empty-module"),
  _stream_passthrough: require.resolve("empty-module"),
  _stream_readable: require.resolve("empty-module"),
  _stream_writable: require.resolve("empty-module"),
  _stream_transform: require.resolve("empty-module"),
  _stream_duplex: require.resolve("empty-module"),
  _stream_wrap: require.resolve("empty-module"),
  buffer: require.resolve("buffer"),
  process: require.resolve("process/browser"),
  util: require.resolve("util"), // Add util polyfill
  url: require.resolve("url"), // Add url polyfill
  zlib: require.resolve("empty-module"),
  path: require.resolve("empty-module"),
  timers: require.resolve("timers-browserify"), // Add timers polyfill
  tty: require.resolve("tty-browserify"), // Add tty polyfill
  constants: require.resolve("constants-browserify"), // Add constants polyfill
  dns: require.resolve("empty-module"), // Add dns polyfill
  dgram: require.resolve("empty-module"), // Add dgram polyfill
  child_process: require.resolve("empty-module"), // Add child_process polyfill
};

// Ensure these packages are installed: empty-module, readable-stream, crypto-browserify, buffer, process, util, url, timers-browserify, tty-browserify, constants-browserify

module.exports = config; 