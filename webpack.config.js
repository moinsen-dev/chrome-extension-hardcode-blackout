const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    background: "./src/background/index.ts",
    content: "./src/content/content-script.ts",
    popup: "./src/ui/popup/index.tsx",
    options: "./src/ui/options/index.tsx",
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
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  devtool: "cheap-module-source-map",
};
