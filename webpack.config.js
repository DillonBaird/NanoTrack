const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node', // Ensures that Webpack bundles for a Node.js environment
  entry: './src/server.js', // Entry point of your application
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'nanoTrack.js' // Output file
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Transpile all .js files
        exclude: /node_modules/, // Exclude the node_modules directory
        use: {
          loader: 'babel-loader', // Use babel-loader for transpiling
          options: {
            presets: ['@babel/preset-env'] // Preset for compiling ES6 and above into ES5
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js'], // Automatically resolve these extensions
    fallback: {
        "mongodb-client-encryption": false ,
        "aws4": false
      }
  },
  externals: [nodeExternals()],
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/ui', to: 'ui' } // Adjust the paths as necessary
      ],
    }),
  ],
};