// output.pathに絶対パスを指定する必要があるため、pathモジュールを読み込んでおく
const path = require("path");

module.exports = {
  // development or production。
  mode: "development",
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{ loader: "ts-loader" }],
      },
    ],
  },
  // エントリーポイントの設定
  entry: "./src/index.ts",
  // 出力の設定
  output: {
    // 出力するファイル名
    filename: "index.js",
    // 出力先のパス
    path: path.join(__dirname, "./public/lib"),
    library: "CtsEM",
    libraryTarget: "umd",
  },
};
