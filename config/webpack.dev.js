const webpack = require('webpack')
const baseConfig = require('./webpack.base.js')
const merge = require('webpack-merge')

module.exports = merge(baseConfig, {
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development')
        })
    ],

    devServer: {
        historyApiFallback: true
    }
})
