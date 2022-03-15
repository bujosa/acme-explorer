const webpack = require('webpack');
const path = require('path');
const isProduction = process.env.NODE_ENV === 'production';
const stylesHandler = 'style-loader';

const config = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, '../public/dist')
  },
  devServer: {
    open: true,
    hot: true,
    host: 'localhost'
  },
  plugins: [
      new webpack.EnvironmentPlugin({
        STRIPE_KEY: 'pk_test_51KIE9yCDrs0vmEnNrXN5gP9Rxpamzic2GK7o6corKvBQQsoqpHteSsDW6UuK4Mrf9LSfEbO0FUBaua2WmTF2SD2p00AtOBaviO',
      })
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset'
      }
    ]
  }
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';
  } else {
    config.mode = 'development';
    config.devtool = 'source-map';
  }
  return config;
};
