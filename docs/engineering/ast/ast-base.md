---
outline: deep
---

### ast 基本使用

```js
let esprima = require('esprima'); //把JS源代码转成AST语法树
let estraverse = require('estraverse'); ///遍历语法树,修改树上的节点
let escodegen = require('escodegen'); //把AST语法树重新转换成代码
let code = `var ast = 'ast is tree';`;
let ast = esprima.parse(code);

estraverse.traverse(ast, {
  enter(node) {
    if (node.type === 'Identifier') {
      node.name = 'jianjian';
    }
    if (node.type === 'VariableDeclaration') {
      node.kind = 'const';
    }
  },
});

console.log(escodegen.generate(ast));
```
