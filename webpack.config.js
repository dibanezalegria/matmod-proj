// webpack.config.js
module.exports = {
    mode: 'development',
    entry: {
        ex1: './js/ex1.js',
        ex2: './js/ex2.js'
    },
    output: {
        filename: '[name].js',
        publicPath: 'dist'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};
