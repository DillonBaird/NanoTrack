const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const JavaScriptObfuscator = require('webpack-obfuscator');
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
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // Removes console logs for production
            drop_debugger: true,
            pure_funcs: ['console.info', 'console.debug', 'console.warn'],
            // Additional compression options can be added here
          },
          mangle: {
            // Mangle options go here
            // properties: {
            //   // Mangle property options (be cautious with this)
            // },
          },
          format: {
            comments: false, // Remove comments
          },
          // Additional Terser options can be added here
        },
        extractComments: false,
      }),
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/ui', to: 'ui' } // Adjust the paths as necessary
      ],
    }),
    new JavaScriptObfuscator({
      // Options for obfuscation
      // See https://github.com/javascript-obfuscator/javascript-obfuscator#options
      rotateStringArray: true,
      stringArray: true,
      stringArrayThreshold: 0.75,
      disableConsoleOutput: true,
      renameGlobals: true,
      // renameProperties: true,
    }, []),
  ],
};