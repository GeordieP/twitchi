const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const pkg = require('../package.json')
const VersNumWriterPlugin = require('./VersNumWriterPlugin')

module.exports = {
    entry: [
        // app
        path.resolve('./src/app/main.js'),
        // styles
        path.resolve('./src/app/styles/main.styl')
    ],

    output: {
        path: path.resolve('build')
    },

    target: "electron-renderer",

    resolve: {
        modules: [
            'node_modules',
            path.resolve('./src'),
            path.resolve('./src/app'),
        ],
        extensions: ['.js', '.json', '.styl']
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/app/index.html",
            filename: "./index.html",
            inject: true,
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
            }
        }),
        new VersNumWriterPlugin({
            output: path.resolve('./src/core'),
            vers: pkg.version
        })
    ],
    
    module: {
        rules: [
            {
                // additional babel config exists in package.json babel section
                test: /\.js?$/,
                loader: 'babel-loader'
            },
            {
                // stylus
                test: /\.styl$/,
                use: ['style-loader', 'css-loader', 'stylus-loader' ]
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
                options: {
                    minimize: true
                }
            },
            {
                // images
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    "file-loader", {
                        loader: "image-webpack-loader",
                        options: {
                            bypassOnDebug: true,
                            // convert png and jpg to webp
                            webp: {
                                quality: 50
                            }
                        }
                    }
                ]
            }
        ]
    }
}
