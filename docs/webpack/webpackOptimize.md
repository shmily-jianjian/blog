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
  // 以下配置，因为两个入口文件即两个chunk都依赖了jquery，
  // 于是我们可以将jquery独立一个entry然后给依赖的模块添加上 dependOn: 'vender'
  // 这样就会将vender单独打包成一个chunk,并且其它入口模块依赖了不在重复打包进去了。
  entry: {
    main: {
      import: './src/index.js',
      dependOn: 'vender',
    },
    main2: {
      import: './src/index2.js',
      dependOn: 'vender',
    },
    vender: 'jquery',
  },
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
      // filename: '[name].css',
      // 这样设置只有css内容变了才会重新打包该css文件
      filename: 'css/[name].[contenthash].css',
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      // 压缩html
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      },
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
    // 默认情况下 production模式下为true， development模式下为false，可以手动控制
    // minimize: true,
    splitChunks: {
      // 多个入口都用到了同一个模块比如jquery，那么jquery就会被单独打包到一个文件， 如果单入口呢？？可以测试下
      // 如果只有一个入口，但是该入口下的多个模块都引入了jquery，webpack也不会重复打包jquery，只会打包一次
      chunks: 'all',
    },
  },
};

module.exports = smp.wrap(config);
```

### webpack 的缓存 hash, chunkhash, contenthash

```js
// 既然 contenthash 缓存最精确为什么不直接都用这个呢，还需要用 hash，chunkhash？ 因为越精确计算成本越高耗时也就越长
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

### 问问 yuanqing 自己的服务器和 cdn 有什么区别？ 我理解的是，一般小公司都没有自己的 cdn，都是买大公司的，因为 cnd 应该是一个网络集群的概念，全国乃至全球都遍及它的服务器，然后如果我们上传到 cdn 上就会就近返回资源，如果我们上传到自己的服务器上，我们的服务器应该只会在一个地方，

### 以我自己的服务器为例子，我的服务器买的时候就会选择华南地区，所以只能从华南地区返回，传输过程中就会有贷款损失所以就会慢～ 既然 cdn 能加速，那我们怎么将前端代码扔到 cdn 上以及如何配置跨域？前端在 cdn 上，但是后端服务器不在
