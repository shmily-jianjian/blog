## rollup 基本使用

```js
// rollup本身是不能加载第三方(node_modules)中的模块的
// @rollup/plugin-node-resolve可以加载node_modules里的模块用来解析依赖的模块路径
// @rollup/plugin-commonjs可以支持commonjs语法
// @rollup/plugin-typescript tslib
// tsc --init
// rollup-plugin-postcss 支持css  类似style-loader
// rollup中没有loader概念都是通过plugin来实现的
// 'rollup-plugin-serve';
//  "dev": "rollup --config -w" 监听文件变化重新执行

import babel from 'rollup-plugin-babel';
import { defineConfig } from 'rollup'
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser'
import postcss from 'rollup-plugin-postcss'
import serve from 'rollup-plugin-serve';

export default defineConfig({
  input:'src/main.ts',
  output:{
    file:'dist/bundle.cjs.js',//输出文件的路径和名称
    format:'iife',//五种输出格式：amd/es6/iife/umd/cjs
    globals: {
      lodash: '_',
    }
  },
  plugins:[
    babel({
        exclude:"node_modules/**"
    }),
    resolve(),
    commonjs(),
    typescript(),
    terser(),
    postcss(),
    serve({
      port: '9000',
      open: true,
      contentBase: './dist',
      // historyApiFallback: true
    })
  ],
  external: 'lodash' 
})

```