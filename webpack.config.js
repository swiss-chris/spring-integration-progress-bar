const path = require("path");
const webpack = require("webpack")
module.exports = {
    entry: "./src/main/typescript/main.ts",
    output: {
        filename: "bundle.js", // all js files are bundled into this single file
        path: path.resolve(__dirname, "src/main/resources/static"),
    },
    devtool: "source-map",
    devServer: {
        static: "./src/main/resources/static",
        port: 9000, //default port: 8080
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader", // TypeScript loader
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env.BACKEND_PORT": JSON.stringify(process.env.BACKEND_PORT),
        }),
    ],
};
