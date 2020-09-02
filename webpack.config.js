var HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { CheckerPlugin } = require('awesome-typescript-loader');
const path = require('path');


const TEMPLATE_DIR = path.resolve(__dirname, './src/server/templates');

module.exports = {
    mode: "development",

    entry: {
        client: './src/client/index.tsx',
    },

    devServer: {
        contentBase: path.join(__dirname, 'static'),
        compress: true,
        historyApiFallback: true,
        port: 9000
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".jsx"]
    },

    output: {
        path: path.join(__dirname,'static'),
        publicPath: '/',
        filename: 'bundle.js',
        libraryTarget: 'umd',
    },

    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                loader: 'awesome-typescript-loader',
                options: {
                    configFileName: 'tsconfig.webpack.json',
                    useCache: true
                }
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                loader: 'file-loader'
            },
            {
                test: /\.ico$/,
                loader: 'file-loader'
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            favicon: 'public/favicon.ico',
            template: path.join(TEMPLATE_DIR, 'default.mustache'),
            filename: "index.html",
        }),
        new CheckerPlugin()
    ],

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    // externals: {
    //     "react": "React",
    //     "react-dom": "ReactDOM"
    // }
};