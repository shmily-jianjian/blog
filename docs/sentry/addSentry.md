## 前端项目接入 sentry

**sentry 服务暂时没有进行私有化部署，如果你想私有化部署请参考 sentry 官网**

     1 进入sentry官网创建一个账号, 我一开始用的google账号，然后提示说我谷歌用的是qq邮箱是个人邮箱不能创建，后面用企业邮箱注册的。

     2 创建一个组织和一个项目，组织后续我用organization表示，项目我用project表示, 项目我选择的是vue，你可以看你情况来选择，大同小异

     3 安装官网文档提示，vue有vue的配置方法，react有react的配置方法

### vue 项目配置过程

```ts
// 新建一个方法初始化sentry
// src/utils/initSentry.ts
import type { App } from 'vue';
import type { Router } from 'vue-router';
import * as Sentry from '@sentry/vue';

export const initSentry = (app: App<Element>, router: Router) => {
  Sentry.init({
    app,
    dsn: 'https://24cf5079f86540d9b707d374b9c64b59@o4505010147950592.ingest.sentry.io/4505010190483456', // 这个dns在你创建项目的时候会自动生成的
    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        tracePropagationTargets: ['http://zhaojian.shopxxx', /^\//], // 这个就是你项目的线上地址
      }),
    ],
    tracesSampleRate: 1.0,
  });
};

// 入口文件main.ts
import { initSentry } from './utils/initSentry';
import App from './App.vue';
import router from './router';

const app = createApp(App);
initSentry(app, router);
```

     这时候你在前端项目中随便 打印一个未定义的变量然后推送到线上，打开线上地址刷新你的 sentry官网点开issuer就能看到这个错误了，但是该错误无法定位到哪一行提示的。

     为了方便使用，我们把sentry网站语言设置为中文, 点击你的组织下拉框=>点击用户设置=>查看右边内容区的语言选择简体中文

### 解决 sentry 错误无法定位到代码具体位置行数

>     我这边用的是vuecli创建的项目，如果你是用的vite请用vite对应的插件，百度下就好了

```ts
// vue.config.js
// 下载 pnpm i @sentry/webpack-plugin
const SentryCliPlugin = require('@sentry/webpack-plugin');

// 使用插件
module.exports = defineConfig({
  configureWebpack: (config) => {
    if (process.env.NODE_ENV !== 'development') {
      config.plugins.push(
        new SentryCliPlugin({
          include: './dist/js', // 只上传js
          ignore: ['node_modules'],
          release: process.env.SENTRY_VERSION || '0.0.1', // 版本号，每次都npm run build上传都修改版本号 对应main.js中设置的Sentry.init版本号
          cleanArtifacts: true, // Remove all the artifacts in the release before the upload.
          // URL prefix to add to the beginning of all filenames. Defaults to ~/ but you might want to set this to the full URL. This is also useful if your files are stored in a sub folder. eg: url-prefix '~/static/js'
          urlPrefix: '~/js', // 线上对应的url资源的相对路径 注意修改这里，否则上传sourcemap还原错误信息有问题, 因为include我只是配置了 ./dist/js
        }),
      );
    }
  },
});
```

>     完成以上配置后，打包部署到服务器上，触发之前的错误，然后你再去sentry官网上看你就能找到那个错误并且能具体到代码哪一行了

**注意以上例子只是简单实现一个流程，具体真实项目你需要具体区分环境等**
