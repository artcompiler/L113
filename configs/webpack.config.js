const path = require('path');

const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, args) => {
  const config = {
    entry: './src/viewer.js',
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: './public', to: '.' },
        ],
      }),
    ],
    output: {
      filename: 'viewer.js',
      path: path.resolve('./dist'),
      clean: true,
    },
  };
  return config;
};