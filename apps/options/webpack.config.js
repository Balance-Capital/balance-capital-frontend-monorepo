const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const nrwlConfig = require("@nrwl/react/plugins/webpack.js");
const { HashFilePlugin, HashTextPlugin } = require("./HashPlugin");

module.exports = (config, context) => {
  config = {
    ...config,
    node: { global: true },
    plugins: [
      ...config.plugins,
      new NodePolyfillPlugin(),
      new HashFilePlugin(),
      new HashTextPlugin(),
    ],
    stats: {
      errorDetails: true,
    },
  };
  return nrwlConfig(config);
};
