import autoprefixer from 'autoprefixer';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as path from 'path';
import postcssModulesValues from 'postcss-modules-values';
import postcssUrl from 'postcss-url';

const devMode = true;

export default {
  mode: devMode ? 'development' : 'production',
  devtool: devMode ? 'cheap-module-eval-source-map' : undefined,
  devServer: devMode
    ? {
        contentBase: path.resolve(__dirname, '../dist'),
      }
    : undefined,
  entry: path.resolve(__dirname, `../harness/index.tsx`),
  target: 'web',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          transpileOnly: true,
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              injectType: 'singletonStyleTag',
            },
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              modules: {
                localIdentName: '[path][name]__[local]--[hash:base64:5]',
              },
            },
          },
          'resolve-url-loader',
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: true,
              plugins: () => [postcssModulesValues(), postcssUrl(), autoprefixer()],
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Refidex Harness',
      template: path.resolve(__dirname, './index.html'),
    }),
  ],
  resolve: {
    // js and jsx includes for node_modules
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.css', '.jpeg'],
    modules: [path.resolve(__dirname, '../node_modules'), path.resolve(__dirname, '../src')],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, '../dist'),
  },
};
