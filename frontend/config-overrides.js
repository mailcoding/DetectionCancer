// config-overrides.js pour react-app-rewired (fallback fs et path)
module.exports = function override(config, env) {
  config.resolve = config.resolve || {};
  config.resolve.fallback = {
    ...(config.resolve.fallback || {}),
    fs: false,
    path: require.resolve('path-browserify'),
  };
  return config;
};
