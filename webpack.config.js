const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  entry: {
    background: "./src/background/index.ts",
    content: "./src/content/content-script.ts",
    popup: "./src/ui/popup/index.tsx",
    options: "./src/ui/options/index.tsx",
    "llama.worker": "./src/background/llama.worker.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.wasm$/,
        type: "webassembly/async",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      fs: false,
      path: false,
      crypto: false,
    },
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/manifest.json", to: "manifest.json" },
        { from: "src/popup.html", to: "popup.html" },
        { from: "src/options.html", to: "options.html" },
        { from: "src/content/styles.css", to: "styles.css" },
        { from: "icons", to: "icons" },
        { from: "src/llama-wasm/llama.wasm", to: "llama.wasm" },
      ],
    }),
  ],
  experiments: {
    asyncWebAssembly: true,
    topLevelAwait: true,
  },
  devtool: "cheap-module-source-map",
};
