---
outline: deep
---

# webpack 优化分析

### import bootstrap from 'bootstrap'查找过程 webpack 中

```js
// 1 默认去node_modules中查找bootstrap包，如果有package.json文件，则在该文件中找到main字段指向的文件
// 2 如果没有package.json则默认查找 该根目录下的index.js文件
// webpack可以修改查找规则, 通过：
module.exports = {
  resolve: {
    extensions: ['.js'],
    mainFields: ['style', 'main'], // package.json中默认先查找哪个字段的
    mainFiles: ['index', 'base'], // 如果没有package.json先找根目录下的index.js没有再找base.js
  },
};
```

### webpack 优化

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const SpeedMeasureWebpackPlugin = require('speed-measure-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const smp = new SpeedMeasureWebpackPlugin();

// ⚠️ smp 和 MiniCssExtractPlugin一起使用时候会报错!!!

// 处理css插件 css-minimizer-webpack-plugin: 压缩css   mini-css-extract-plugin: 将js中用到的css单独抽离到一个css文件中
// 处理js terser-webpack-plugin // webpack5内置了

/**
 * @type {import('webpack').Configuration}
 */

const config = {
  module: {
    // 如果有的模块你知道他没有肯定没有依赖其他模块，我们就可以在这里配置，避免webppack去检查依赖的时候去解析该模块是否依赖了其他模块 (我该如何确定该模块是否依赖了其他模块呢???)
    noParse: /lodash|jquery/,
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          // {
          //   loader: 'style-loader',
          // },
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new webpack.IgnorePlugin({
      // 忽略的插件所在目录
      contextRegExp: /moment$/,
      // 目录的那些资源
      resourceRegExp: /locale/,
    }),
    // 打包结果分析
    new BundleAnalyzerPlugin(),
  ],
  optimization: {
    // 不用...将会导致内置的terser-webpack-plugin失效, ...是语法来扩展现有的 minimizer
    minimizer: ['...', new CssMinimiz()],
  },
};

module.exports = smp.wrap(config);
```

### 如何利用 webpack 打包库

```js
// 当我们需要写个库供他人使用时

// ============打包成esmodule格式=============
module.exports = {
  experiments: {
    outputModule: true,
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    library: {
      // 这里要注释掉否则报错
      // name: 'jianjian'
      type: 'module',
    },
  },
};

// ============打包成其它格式(var, commonjs, commonjs2. umd...)=============
module.exports = {
  output: {
    path: path.resolve(__dirname, 'build'),
    library: {
      // 打包库的名称不是npm的名称！
      name: 'jianjian',
      type: 'commonjs',
    },
  },
};
// type 可以是var commonjs commonjs2  umd module等等...
// var 表示的是打包出一个变量 jianjian并且挂载到window上, 这样的模块只能通过script标签引入使用
// commonjs和commonjs2表示打包为commonjs模块，只不过打出来的包导出方式不一样，
// 一个是exports.jianjian=xxx一个是module.exports.jianjian = xx导出
// umd的
```

### 什么是 umd？兼容 amd（requirejs）var commonjs commonjs2,

```js
// 我们看一下打包成umd格式的代码
(function webpackUniversalModuleDefinition(root, factory) {
  if (typeof exports === 'object' && typeof module === 'object') module.exports = factory();
  else if (typeof define === 'function' && define.amd) define([], factory);
  else if (typeof exports === 'object') exports['jianjian'] = factory();
  else root['jianjian'] = factory();
})(self, () => {
  return (() => {
    'use strict';
    var webpackRequire = {};
    (() => {
      webpackRequire.d = (exports, definition) => {
        for (var key in definition) {
          if (webpackRequire.o(definition, key) && !webpackRequire.o(exports, key)) {
            Object.defineProperty(exports, key, {
              enumerable: true,
              get: definition[key],
            });
          }
        }
      };
    })();
    (() => {
      webpackRequire.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
    })();
    (() => {
      webpackRequire.r = (exports) => {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
          Object.defineProperty(exports, Symbol.toStringTag, {
            value: 'Module',
          });
        }
        Object.defineProperty(exports, 'esmodule', {
          value: true,
        });
      };
    })();
    var webpackExports = {};
    webpackRequire.r(webpackExports);
    webpackRequire.d(webpackExports, {
      add: () => add,
    });
    const add = (a, b) => {
      return a + b;
    };
    return webpackExports;
  })();
});

// 分析以上代码umd模块其实是一个自执行函数，执行函数的时候判断当前文件
// 是否使用了exports和module ===> commonjs2格式
// 使用了exports ===> commonjs格式
// 使用define ===> amd格式
// 最后else ===> var格式
```
