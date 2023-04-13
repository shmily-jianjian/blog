---
outline: deep
---

# 前端项目打包部署全部流程(手把手教学)

**最近用 vitepress 搭了个简单项目主要是为了记录一些笔记和文档。整个流程是前端写了文档后 => push 到 github 上 => 自动部署到服务器上，类似于我们工作中的开发流程。**

废话不多说上流程

### 1-1 先看下项目配置

先看下我的 config 部分配置, 以下配置以你自己为准, 后续步骤注意替换

```ts
{
  base: '/blog/', // 我希望访问我地址的时候能有个/blog区分 http://zhaojian.shop/blog/xxxxx
  outDir: '../blog', // 我项目打包完会再跟目录下的blog文件夹下, 一般情况下都是dist，因为我是个博客项目所以改名blog
}
// 以上配置你完全可以使用默认打的
```

### 1-2 打包项目

通过以上配置后，假设我已经开发完了打包项目, 生成的目录就在项目目录下的 blog 文件夹下，你默认应该是在 dist 下

### 1-3 配置 ci

因为我是推到 github 上, 所有按照的 github 的要求操作

跟目录下新建 .github/workflows/main.yml

```yaml
name: Blog
on:
  push:
    branches: ['main'] # 你可以改成master看你自己
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      # 1 下载代码
      - uses: actions/checkout@v3
      # 2 安装pnpm 因为我用的pnpm，你如果用的yarn或者npm需要去使用别的包
      - uses: pnpm/action-setup@v2.2.4
        with:
          # Version of pnpm to install
          version: '7.9.0'

      # 安装依赖
      - name: 安装依赖
        run: pnpm install

      # 打包
      - name: 开始打包
        run: pnpm build

      # ssh
      - name: 部署到服务器
        uses: easingthemes/ssh-deploy@v4.1.8
        with:
          # 登陆ssh时候的 sshkey
          SSH_PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
          # Remote host
          REMOTE_HOST: ${{ secrets.HOST }}
          # Remote user
          REMOTE_USER: ${{ secrets.USERNAME }}
          # Remote port
          SOURCE: ./blog #一般是dist
          TARGET: /usr/local/nginx/html/www # 这里是项目存放在服务器的哪个文件下
```

以上操作前提是你服务器已经装好了 nginx，没有请先安装并且创建好项目打包后存放的目录文件，并且 nginx 中的端口也配置好了，我是放在/usr/local/nginx/html/www 下, 具体的操作你可以百度 服务器如何安装配置 nginx

以上 ssh 这一步你还需要做以下操作[参考文档](https://github.com/marketplace/actions/ssh-deploy):

**1-3-1: 先登陆你的服务，我的是 mac 所以以 mac 为例，window 可以下别的工具或者你直接在阿里云官网登入服务器(我的服务器是阿里云，大同小异), 打开终端输入**

```ts
1 ssh root@你的服务器ip
2 cd .ssh/
3 ssh-keygen -m PEM -t rsa -b 4096
4 生成密钥后将你的公钥添加到 authorized_keys文件下
	4-1 cat ~/.ssh/id_rsa.pub 显示出来后复制一下
	4-2 vim ~/.ssh/authorized_keys 打开authorized_keys文件后按 i 进入编辑模式将上一步复制的公钥粘贴进去, 再按 i退出编辑模式, 再按:wq保存退出
5 打开你的项目的github地址，点击Settings，找到 Secrets and variables, 找到Actions，点击new reponsitory secret添加三个参数(因为main.yml中我推送到服务器时要这三个参数连接)

SSH_PRIVATE_KEY # 就是你在服务器上生成的私钥
REMOTE_HOST # 你服务器的ip地址
REMOTE_USER # 你登陆服务器的账户名 我是root， 一般也是写root
```

完成以上 ci 配置后，假设你推送到 github 上了，这时候就会触发该项目中的 action 构建，具体的构建日志你可以点进去看，如果失败了请看构建日志，一般情况下都是连接服务器时候你的公钥和私钥没配好，⚠️ 都是服务器生成的密钥不是电脑本地的

**如果构建成功了，后续你有新的改动直接 push 到仓库，仓库会自动执行 main.yml 进行构建和部署到你的服务器上**
