module.exports = {
  entry: "./src/trunk.js",
  output: {
    path: __dirname,
    filename: "trunk.js",
    library: 'Trunk',
    libraryTarget: 'umd'
  },
  externals: {
    "jquery": "jQuery"
  }
}