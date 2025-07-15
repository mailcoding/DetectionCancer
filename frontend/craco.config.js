const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (config) => {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        path: require.resolve('path-browserify'),
      };
      return config;
    },
  },
};
