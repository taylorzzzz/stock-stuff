const path = require('path');

module.exports = {

    entry: './client/src/js/index.js',
    output: {
        path: path.resolve(__dirname, 'client/build/js'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            }
        ]
    }
}

