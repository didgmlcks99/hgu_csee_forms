const HtmlWebpackPlugin = require('html-webpack-plugin');
// const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
    mode: 'development',
    devtool: 'eval-source-map',
    entry: {
        index: './src/index.js',
        login: './src/login/login.js',
        signup: './src/signup/signup.js',
        home: './src/home/home.js',
        adminHome: './src/admin.home/admin.home.js',
        adminSet: './src/admin.set/admin.set.js',
        apply: './src/apply/apply.js',
        applied: './src/applied/applied.js',
        adminMake: './src/admin.make/admin.make.js',
        adminStat: './src/admin.stat/admin.stat.js',
        adminEvents: './src/admin.events/admin.events.js',
        adminRand: './src/admin.rand/admin.rand.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    watch: true,
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    plugins: [
        new Dotenv(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html',
            chunks: ['index'],
        }),
        new HtmlWebpackPlugin({
            filename: 'login.html',
            template: './src/login/login.html',
            chunks: ['login'],
        }),
        new HtmlWebpackPlugin({
            filename: 'signup.html',
            template: './src/signup/signup.html',
            chunks: ['signup'],
        }),
        new HtmlWebpackPlugin({
            filename: 'home.html',
            template: './src/home/home.html',
            chunks: ['home'],
        }),
        new HtmlWebpackPlugin({
            filename: 'admin.home.html',
            template: './src/admin.home/admin.home.html',
            chunks: ['adminHome'],
        }),
        new HtmlWebpackPlugin({
            filename: 'admin.set.html',
            template: './src/admin.set/admin.set.html',
            chunks: ['adminSet'],
        }),
        new HtmlWebpackPlugin({
            filename: 'apply.html',
            template: './src/apply/apply.html',
            chunks: ['apply'],
        }),
        new HtmlWebpackPlugin({
            filename: 'applied.html',
            template: './src/applied/applied.html',
            chunks: ['applied'],
        }),
        new HtmlWebpackPlugin({
            filename: 'admin.make.html',
            template: './src/admin.make/admin.make.html',
            chunks: ['adminMake'],
        }),
        new HtmlWebpackPlugin({
            filename: 'admin.stat.html',
            template: './src/admin.stat/admin.stat.html',
            chunks: ['adminStat'],
        }),
        new HtmlWebpackPlugin({
            filename: 'admin.events.html',
            template: './src/admin.events/admin.events.html',
            chunks: ['adminEvents'],
        }),
        new HtmlWebpackPlugin({
            filename: 'admin.rand.html',
            template: './src/admin.rand/admin.rand.html',
            chunks: ['adminRand'],
        }),
    ]
};