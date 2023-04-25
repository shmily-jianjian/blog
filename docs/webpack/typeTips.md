---
outline: deep
---

# webpack.config.js 和 babel.config.js 如何有类型提示?

### webpack.config.js

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * @type {import('webpack').Configuration}
 */

const config = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
};

module.exports = config;
```

### babel.config.js

```js
/**
 * @type {import('@babel/core').TransformOptions}
 */

const config = {
  plugins: [],
};

module.exports = config;
```
