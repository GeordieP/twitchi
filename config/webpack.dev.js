const webpack = require('webpack')
const baseConfig = require('./webpack.base.js')
const merge = require('webpack-merge')

module.exports = merge(baseConfig, {
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        }),
    ],

    devServer: {
        historyApiFallback: true,

        // NOTE: stats none is so we can use webpack-stylish.
        // NOTE: this option is also set inside webpack.base.js
        stats: 'none',
    }
})
