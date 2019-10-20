const path = require('path');

module.exports = {
  entry: './client/index.jsx',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'client'),
  },
  devServer: {
    contentBase: path.join(__dirname, 'client'),
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader' }
    ]
  }
}
