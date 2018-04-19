const webpack = require('webpack')
const baseConfig = require('./webpack.base.js')
const merge = require('webpack-merge')
const path = require('path')

// plugins
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WebpackCleanupPlugin = require('webpack-cleanup-plugin')

module.exports = merge(baseConfig, {
    plugins: [
        // prod builds extract their styles into a single css file
        new MiniCssExtractPlugin({
            filename: './main.css',
            chunkFilename: '[id].css'
        }),

        new OptimizeCSSPlugin({
            cssProcessorOptions: {
                safe: true
            }
        }),

        new CopyWebpackPlugin([
            // window script (electron entry point)
            {
                from: path.resolve('./src/window.js'),
                to: './'
            },

            // core directory - electron app "backend"
            {
                from: path.resolve('./src/core'),
                to: './core'
            },

            // resources
            {
                from: path.resolve('./resources/twitchi.png'),
                to: './resources'
            },
        ]),

        // clean up (remove) the output directory before we start writing to it
        new WebpackCleanupPlugin(),

        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ],

    module: {
        rules: [
            {
                // pass stylus code through stylus, css loader, and then extract it into a standalone css file
                test: /\.styl$/,
                use: [ MiniCssExtractPlugin.loader, 'css-loader', 'stylus-loader' ]
            }
        ]
    },

    node: {
        // prevent webpack from injecting mocks to node modules
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty'
    }
})
