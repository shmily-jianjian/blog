---
outline: deep
---

## 简单实现几个简单 babek 插件

### babel 箭头函数转换插件基本逻辑

```js
const core = require('@babel/core');

const types = require('@babel/types');

// 箭头函数转普通函数注意点(this问题，箭头替换)

let arrowFunctionPlugin = {
  visitor: {
    //如果是箭头函数，那么就会进来此函数，参数是箭头函数的节点路径对象
    // 这个path参数包括很多属性和方法，像当前的节点和操作节点的方法等等
    ArrowFunctionExpression(path, state) {
      const { node } = path;
      // 处理this问题
      hoistFunctionEnvironment(path);
    },
  },
};

/**
 *
 * @param {节点路径对象} path
 */
function hoistFunctionEnvironment(path) {
  //1.确定我要用哪里的this 向上找不是箭头函数的函数或者根节点
  const thisEnv = path.findParent((parent) => {
    // 父节点是普通函数并且当前path不是箭头函数  或者是根节点
    return (parent.isFunction() && !path.isArrowFunctionExpression()) || parent.isProgram();
  });
  // 定义一个变量
  const thisBindings = '_this';
  // 获取this所在的节点路径
  const thisPaths = getThisPaths(path);
  // 这样就添加了一个_this变量
  if (thisPaths.length) {
    if (!thisEnv.scope.hasBinding(thisBindings)) {
      thisEnv.scope.push({
        id: types.identifier(thisBindings),
        init: types.thisExpression(),
      });
    }
  }
  thisPaths.forEach((thisPath) => {
    //this=>_this
    thisPath.replaceWith(types.identifier(thisBindings));
  });
}

function getThisPaths(path) {
  const thisPaths = [];
  // 对传入的节点路径进行遍历, 遍历的时候如果是this表达式则将对应的path都添加到thisPaths中
  path.traverse({
    ThisExpression(path) {
      thisPaths.push(path);
    },
  });
  return thisPaths;
}

let sourceCode = `
const sum = (a, b) => {
    console.log(this);
    return a + b;
}
`;

let targetSource = core.transform(sourceCode, {
  plugins: [arrowFunctionPlugin],
});

console.log(targetSource.code);
```

### 上述 path 参数

```js
node 当前 AST 节点
parent 父 AST 节点
parentPath 父AST节点的路径
scope 作用域
get(key) 获取某个属性的 path
set(key, node) 设置某个属性
is类型(opts) 判断当前节点是否是某个类型
find(callback) 从当前节点一直向上找到根节点(包括自己)
findParent(callback)从当前节点一直向上找到根节点(不包括自己)
insertBefore(nodes) 在之前插入节点
insertAfter(nodes) 在之后插入节点
replaceWith(replacement) 用某个节点替换当前节点
replaceWithMultiple(nodes) 用多个节点替换当前节点
replaceWithSourceString(replacement) 把源代码转成AST节点再替换当前节点
remove() 删除当前节点
traverse(visitor, state) 遍历当前节点的子节点,第1个参数是节点，第2个参数是用来传递数据的状态
skip() 跳过当前节点子节点的遍历
stop() 结束所有的遍历
```

### 上述参数 scope

```js
scope.bindings 当前作用域内声明所有变量
scope.path 生成作用域的节点对应的路径
scope.references 所有的变量引用的路径
getAllBindings() 获取从当前作用域一直到根作用域的集合
getBinding(name) 从当前作用域到根使用域查找变量
getOwnBinding(name) 在当前作用域查找变量
parentHasBinding(name, noGlobals) 从当前父作用域到根使用域查找变量
removeBinding(name) 删除变量
hasBinding(name, noGlobals) 判断是否包含变量
moveBindingTo(name, scope) 把当前作用域的变量移动到其它作用域中
generateUid(name) 生成作用域中的唯一变量名,如果变量名被占用就在前面加下划线
```

### 实现 babel 转类(Class)的插件

```js
const transformClassPlugin = {
  visitor: {
    ClassDeclaration(path, state) {
      const node = path.node;
      const id = node.id;
      const methods = node.body.body;

      const nodes = [];
      methods.forEach((method) => {
        // 处理constructor
        if (method.kind === 'constructor') {
          const constructorFunction = types.functionDeclaration(id, method.params, method.body);
          nodes.push(constructorFunction);
        } else {
          // Person.prototype.sayName = function() { ... }
          // memberExpression => Person.prototype.sayName
          const memberExpression = types.memberExpression(
            types.memberExpression(id, types.identifier('prototype')),
            method.key,
          );
          // functionExpress => function() { ... }
          const functionExpress = types.functionExpression(null, method.params, method.body);
          // 将上面两个用 = 一左一右拼接起来
          const assignmentExpress = types.assignmentExpression(
            '=',
            memberExpression,
            functionExpress,
          );
          nodes.push(assignmentExpress);
        }
      });

      if (nodes.length === 1) {
        //单节点用replaceWith
        //path代表路径，用nodes[0]这个新节点替换旧path上现有老节点node ClassDeclaration
        path.replaceWith(nodes[0]);
      } else {
        path.replaceWithMultiple(nodes);
      }
    },
  },
};

const sourceCode = `
class Person{
  constructor(name){
      this.name = name;
  }
  sayName(){
      console.log(this.name);
  }
}
`;

const targetSource = core.transform(sourceCode, {
  plugins: [transformClassPlugin],
});

console.log(targetSource.code);

// function Person(name) {
//   this.name = name;
// }
// Person.prototype.sayName = function () {
//   console.log(this.name);
// }
```

### 每个访问器函数接受连个参数(path, state) path 是节点对象包含很多方法，这个 state 就相当于一个全局对象，你可以在这个函数上修改和设置值，在另一个函数上的 state 参数上拿到这个值，用于多个函数之间传递参数

### 每次打印的时候都加上行 列和文件名

```js
const core = require('@babel/core');
const types = require('@babel/types');
const pathLib = require('path');

const transformClassPlugin = {
  visitor: {
    CallExpression(path, state) {
      const node = path.node;
      if (types.isMemberExpression(node.callee)) {
        console.log(node.callee.property.name);
        if (
          node.callee.object.name === 'console' &&
          ['log', 'warn', 'debug', 'info', 'error'].includes(node.callee.property.name)
        ) {
          const { line, column } = node.loc.start;
          const relativeFileName = pathLib.relative(__dirname, state.file.opts.filename);
          node.arguments.unshift(types.stringLiteral(`${relativeFileName} ${line}:${column}`));
        }
      }
    },
  },
};

const sourceCode = `
  console.log('jianjian is a man')
`;

const targetSource = core.transform(sourceCode, {
  filename: 'main.js',
  plugins: [transformClassPlugin],
});

console.log(targetSource.code);
```
