---
outline: deep
---

## 实现一个 babel 插件并在 vue 中使用

**以下涉及到一些 ast 的知识以及 babel 的一些库的用法，我们不必太过纠结，本文主要是了解一个 babel 插件的实现思路和过程**

```js
// vue-cli创建项目

// auto-track-plugin.js
const core = require('@babel/core');
const types = require('@babel/types');
const importModule = require('@babel/helper-module-imports');
const template = require('@babel/template');

// 先明确我们要做啥? 我想给做一个埋点操作，并且该埋点只能在 以 jianjian_ 开头的函数触发
// 1 找到满足条件的节点（得是函数，并且函数名是以jianjian_ 开头的函数才需要自动触发埋点）
// 2

function ggg() {}

// 如何没有生效请删除 node_modules/.cache目录
// 好像只有 production环境在进来
const autoTrackerPlugin = (_, options) => {
  // 我们从babel.config.js传入的参数
  const { methodName, moduleName, functionPrefix } = options;
  return {
    visitor: {
      // Program程序节点也是跟节点，进入程序就会执行这里的逻辑
      Program: {
        enter(path, state) {
          let importName;
          path.traverse({
            ImportDeclaration(path) {
              // 获取到我们导入的模块名，import a from 'b' importModuleName就是b
              // 从哪个模块导入的
              const importModuleName = path.get('source').node.value;
              if (importModuleName === moduleName) {
                // 导入的名称或者内容
                const specifierpath = path.get('specifiers.0'); // 是一个数组取第一项
                // 如果是默认导出 import a from 'b'这种
                // 或者是 import * as a from 'b'
                // 或者是 import { a } from 'b'
                if (
                  specifierpath.isImportDefaultSpecifier() ||
                  specifierpath.isImportNamespaceSpecifier() ||
                  specifierpath.isImportSpecifier()
                ) {
                  // 这个 importName 就是 a
                  importName = specifierpath.node.local.name;
                }
                path.stop(); // 停止遍历
              }
            },
          });
          // 遍历完成后importName还是没值说明代码没有引入模块
          // 所以默认给代码添加一个默认导入
          if (!importName) {
            // 添加一个默认导入，导入的模块名为 moduleName, 导入的方法名为 methodName，如果重名了自动帮我们添加下划线等操作避免重名
            importName = importModule.addDefault(path, moduleName, {
              nameHint: path.scope.generateUid(methodName),
            });
          }

          // 返回一个语法树节点
          // 以下代码的意思是： template先定义一个变量methodName方法并且调用该方法， 类似模版引擎，methodName是动态的可以替换的，类似函数参数，返回的是一个函数
          // 所以我们可以再调用返回的函数传入我们真正的方法名 importName,
          // 以上操作最终会在代码中增加一段代码   importName()
          // ⚠️METHODNAME不大写一直报错不知道是不是要求这样
          state.newNode = template.statement(`METHODNAME()`)({
            METHODNAME: importName,
          });
        },
      },
      // 找到函数节点
      // 普通函数 function xx() {}
      // 箭头函数 const xx = () => {}
      // 声明式函数 const xx = fucntion() => {}
      // 类里面的函数 class xx { xx() {}}
      'FunctionDeclaration|ArrowFunctionExpression|FunctionExpression|ClassMethod'(path, state) {
        const { node } = path;
        let functionName;
        if (path.get('id').node && path.get('id').node.name) {
          functionName = path.get('id').node.name;
          // 我希望以 jianjian_ 开头的函数在调用注入的方法
          if (functionName.startsWith(functionPrefix)) {
            // 如果该函数包含了 {}, 因为有的函数简写可以省略 {}
            if (types.isBlockStatement(node.body)) {
              // 57行上面存了这个函数节点
              node.body.body.unshift(state.newNode);
            } else {
              // 生成一个块 {}并且添入 state.newNode, types.expressionStatement(node.body)
              const newBlockNode = types.blockStatement([
                state.newNode,
                types.expressionStatement(node.body),
              ]);
              path.get('body').replaceWith(newBlockNode);
            }
          }
        }
      },
    },
  };
};

module.exports = autoTrackerPlugin;

// babel.config.js
module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  plugins: [
    [
      './src/utils/auto-track-plugin.js',
      {
        // 我们希望自动引入以下代码
        // import flatter from 'lodash'
        // 并且只在以jianjian_ 开头的函数中调用该方法
        methodName: 'flatter',
        moduleName: 'lodash',
        functionPrefix: 'jianjian_',
      },
    ],
  ],
};
```

### 测试一下

```js
// main.js 写入一下函数
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');

function test() {
  return 1 + 1;
}

function jianjian_test() {
  return 1 + 1;
}

// 最后会发现会在js文件上加入以下代码
// var _faltter2 = _interopRequireDefault(require("lodash")).default;
// 但是我们希望的是import { flatter } from 'lodash', 为什么会是这样你可以百度下，其实一样的功能
// 只有是jianjian_ 开头的函数内会调用 _faltter2()
```
