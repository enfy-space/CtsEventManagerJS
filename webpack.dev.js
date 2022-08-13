const { merge } = require('webpack-merge') // webpack-merge
const common = require('./webpack.common.js')

module.exports = merge(common, {
    // development or production。
    mode: "development",
    devtool: 'eval-source-map',
});
