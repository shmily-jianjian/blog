# webpack build 产物简单分析

### 源文件 commonjs 加载 commonjs

```js
// title.js
let age = 20;
let name = 'jianjian';
const modify = () => {
  age = 30;
  name = 'xiaojin';
};

module.exports = {
  age,
  name,
  modify,
};

// 入口文件 index.js
const { age, name, modify } = require('./title.js');
console.log(age);
console.log(name);
modify();
console.log(age);
console.log(name);
```

### 上面打包产物(去除了注释和自执行括号)

```js
var webpackModules = {
  './src/title.js': (module) => {
    let age = 20;
    let name = 'jianjian';
    const modify = () => {
      age = 30;
      name = 'xiaojin';
    };
    module.exports = {
      age,
      name,
      modify,
    };
  },
};
var webpackModuleCache = {};
function webpackRequire(moduleId) {
  var cachedModule = webpackModuleCache[moduleId];
  if (cachedModule !== undefined) {
    return cachedModule.exports;
  }
  var module = (webpackModuleCache[moduleId] = {
    exports: {},
  });
  webpackModules[moduleId](module, module.exports, webpackRequire);
  return module.exports;
}
var webpackExports = {};

const { age, name, modify } = webpackRequire('./src/title.js');
console.log(age);
console.log(name);
modify();
console.log(age);
console.log(name);

// 分析上面代码可以知道，就算我们调用了modify修改了age和name，但是我们发现打印的age和name还是之前的
// 因为我们看module的exports属性是一个对象，该对象上的age和name是值的拷贝
```

### 源文件 commonjs 加载 esmodule

```js
// title.js
let info = {
  name: 'jianjian',
  age: 20,
};
const modify = () => {
  info.age = 30;
  info.name = 'xiaojin';
};

export default {
  modify,
  info,
};

// 入口文件 index.js
const { age, name, modify } = require('./title.js');
console.log(age);
console.log(name);
modify();
console.log(age);
console.log(name);
```

### 上面打包产物(去除了注释和自执行括号)

---

## outline: deep

```js
var webpackModules = {
  './src/title.js': (unusedWebpackModule, webpackExports, webpackRequire) => {
    'use strict';
    webpackRequire.r(webpackExports);
    webpackRequire.d(webpackExports, {
      default: () => webpackDefaultExport,
    });
    let info = {
      name: 'jianjian',
      age: 20,
    };
    const modify = () => {
      info.age = 30;
      info.name = 'xiaojin';
    };
    const webpackDefaultExport = {
      modify,
      info,
    };
  },
};
var webpackModuleCache = {};
function webpackRequire(moduleId) {
  var cachedModule = webpackModuleCache[moduleId];
  if (cachedModule !== undefined) {
    return cachedModule.exports;
  }
  var module = (webpackModuleCache[moduleId] = {
    exports: {},
  });
  webpackModules[moduleId](module, module.exports, webpackRequire);
  return module.exports;
}
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
webpackRequire.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
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
var webpackExports = {};
const { info, modify } = webpackRequire('./src/title.js');
console.log(info.age);
console.log(info.name);
modify();
console.log(info.age);
console.log(info.name);

// 我们看到它调用了  webpackRequire.r 这个方法，给我们模块打上了两个标识表示是 esmodule
// 然后调用了 webpackRequire.d 这个方法，遍历了以下代码
// {
//   default: () => webpackDefaultExport,
// }
// 然后
// Object.defineProperty(exports, key, {
//   enumerable: true,
//   get: definition[key],
// });
// 给exports的每个key(default)的get方法绑定了一个函数
// 这样每次获取导出的属性的时候就会触发geter就能拿到最新值了
```
