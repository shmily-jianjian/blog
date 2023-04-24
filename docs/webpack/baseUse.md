---
outline: deep
---

# webpack 基本使用

### 命令脚本

```js
"scripts": {
    "dev": "cross-env NODE_ENV=development webpack-dev-server",
    "build": "cross-env NODE_ENV=development webpack",
    "build:pro": "cross-env NODE_ENV=production webpack"
  },
```

### 基本配置

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV,
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, './dist'),
    assetModuleFilename: 'images/[hash][ext][query]',
    clean: true,
  },
  entry: './src/index.js',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      title: 'webpack',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader', 'postcss-loader'],
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader', 'postcss-loader'],
      },
      {
        test: /\.png$/,
        type: 'asset/resource',
        generator: {
          filename: 'png/[hash][ext]',
        },
      },
      {
        test: /\.jpg$/,
        type: 'asset/resource',
        generator: {
          filename: 'jpg/[hash][ext]',
        },
      },
      {
        test: /\.txt$/,
        type: 'asset/source',
      },
    ],
  },
  devServer: {
    port: 4000,
    open: true,
    static: path.resolve(__dirname, './public'),
  },
};

// 默认情况下 public是项目的静态资源文件存放目录， 我们可以直接通过 http://xxxx.xxx.(png, jpg, html...)
// 可以通过 devSerever的static配置修改：
// devServer: {
//     port: 4000,
//     open: true,
//     static: path.resolve(__dirname, './public2222'),
//   },
```

### 资源模块配置区别

```js
module.exports = {
  output: {
    ...
    assetModuleFilename: 'images/[hash][ext][query]',
  }
  // 'asset/source' 一般处理源文件像 .txt啊这种 直接返回文件的内容
  // 'asset/resource' 一般处理图片啊
  // 'asset/inline' 一般转为base64
  // 'asset' 通用 自动选择
  module: {
    rules: [
      {
        test: /\.png$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024 // 大于4k type就是asset/resource 否则就是asset/inline
          }
        },
        generator: {
          filename: 'png/[hash][ext]',
        },
      },
      // 可以将打包的图片存放目录调整
      // 为什么小的图片转base64, 大大图片不要转??
      // 首先转base64是为了减少http请求，而转为大图片不转是因为转base64后会增大图片体积比如5K的图片转base64后可能变成5.5k了～
      // 如果你想给每个静态资源细分打包目录
      {
        test: /\.jpg$/,
        type: 'asset/resource',
        // 这里可以细分
        generator: {
          filename: 'jpg/[hash][ext]',
        },
      },
    ]
  },
}
```

### 多入口配置

```js
// 什么时候需要多入口配置，比如说你的项目其实可以下分为两个子项目(就假设一个是h5，一个是pc)，那我门是不是需要两个入口，因为这两个项目需要导入的文件都不一样
// webpack.config.js
module.exports = {
  entry: {
    pc: './src/pc.js',
    h5: './src/h5.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/pc.html',
      filename: 'pc.html',
      title: 'pc',
      chunks: ['pc'],
    }),

    new HtmlWebpackPlugin({
      template: './src/h5.html',
      filename: 'h5.html',
      title: 'h5',
      chunks: ['h5'],
    }),
  ],
};

// HtmlWebpackPlugin这个插件可以帮你生成html模版，你需要几个你就用几个就好了，每个模版需要的引入的恶js就是配置中的chunks
// 以上打包后你会发现，dist下面生成两个js文件(pc.js, h5.js), 两个html文件(pc.html, h5.html), 并且该html分别引入了对应的js文件
```

### 通过 DefinePlugin 提供配置给项目使用

```js
// 假设我们现在有个需求:
// 执行 pnpm serve:dev的时候axios请求的地址是 http://dev.com
// 执行 pnpm serve:test的时候axios请求的地址是 http://test.com
// 执行 pnpm serve:pro的时候axios请求的地址是 http://pro.com

// 修改package.json脚本
// "scripts": {
//   "dev": "cross-env NODE_ENV=development webpack-dev-server",
//   "dev:test": ""cross-env NODE_ENV=test webpack-dev-server",
//   "dev:pro": ""cross-env NODE_ENV=production webpack-dev-server"
// },

let requestConfig;
if (process.env.NODE_ENV === 'development') {
  requestConfig = require('./dev.config.js');
} else if (process.env.NODE_ENV === 'test') {
  requestConfig = require('./test.config.js');
} else {
  requestConfig = require('./pro.config.js');
}

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      apiUrl: JSON.Stringify(requestConfig),
    }),
  ],
};

// 然后你可以在你的业务代码中拿到拿到apiUrl了
console.log(apiUrl);
```

### css 兼容处理 postcss-loader 以及它的预设 postcss-preset-env

```js
// postcss是用来处理css兼容性问题的(css界的babel)
// postcss-loader是用来连接webpack和postcss的本身不会处理css问题的
// 只有通过插件才可以而postcss-preset-env包含了很多css处理插件，包含自动前缀等等，
```

```js
// 1 pnpm i postcss-loader postcss-preset-env
// webpack.config.js
module.exports = {
  // ...
  module: {
    rules: [
      // 以less为例子
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader'],
      },
    ],
  },
};

// postcss.config.js
const postcssPresetEnv = require('postcss-preset-env');

module.exports = {
  plugins: [
    postcssPresetEnv({
      // 支持最新的五个版本
      browsers: 'last 5 version',
    }),
  ],
};
```

### js 兼容处理 babel-loader 以及它的预设 @babel/preset-env

```js
// babel是用来处理js兼容性问题的(像es6+的一些语法，箭头函数，扩展运算符，async，await等等)
// babel-loader是用来连接webpack和babel的本身不会处理js问题的，只有通过插件才可以
// @babel/preset-env包含了很多js处理插件，但是无法转Promise, core-js(babel-polyfill这个包已经废弃了)
```

```js
// 1 pnpm i babel-loader @babel/preset-env core-js -D
// webpack.config.js
module.exports = {
  // ...
  module: {
    rules: [
      // 以less为例子
      {
        test: /\.js$/,
        use: ['babel-loader'],
      },
    ],
  },
};

// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        // shippedProposals: true, // 可以直接在corejs中配置 proposals
        corejs: { version: '3', proposals: true },
      },
    ],
  ],
};
```
