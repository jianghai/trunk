module.exports = {
  entry: "./src/trunk.js",
  output: {
    path: __dirname,
    filename: "Trunk.js",
    library: 'Trunk',
    libraryTarget: 'umd'
  },
  externals: {
    "jquery": "jquery"
  }
}