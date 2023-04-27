# webpack 中，module，chunk 和 bundle 的区别是什么？

```js
// ======什么是module?======
// 直白点就是我们写的一个个文件，在webpack中所有的文件都是一个个模块module
// 就是js的模块化webpack支持commonJS、ES6等模块化规范，简单来说就是你通过import语句引入的代码

// ======什么是chunk?======
// 我们写的一个个被webpack处理，处理时候会产生一系类chunk
// chunk是webpack根据功能拆分出来的，包含三种情况
// 你的项目入口（entry）
// 通过import()动态引入的代码
// 通过splitChunks拆分出来的代码

// ======什么是bundle?======
// 被webpack处理完且运行在浏览器的叫做bundle，chunk和bundle差不多～
// bundle是webpack打包之后的各个文件，一般就是和chunk是一对一的关系，bundle就是对chunk进行编译压缩打包等处理之后的产出
```
