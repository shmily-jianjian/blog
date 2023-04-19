import { DefaultTheme } from 'vitepress';

const sidebar: DefaultTheme.Sidebar = {
  '/': [
    {
      text: 'babel',
      items: [
        { text: 'babel插件并在vue项目使用', link: '/engineering/babel/babel-plugin' },
        { text: '简单实现几个简单babek插件', link: '/engineering/babel/babel-plugin-others' },
      ],
    },
    {
      text: 'ast',
      items: [{ text: 'ast的基本使用', link: '/engineering/ast/ast-base' }],
    },
    {
      text: 'vue',
      items: [
        { text: 'Markdown Examples', link: '/vue/markdown-examples' },
        { text: 'Runtime API Examples', link: '/vue/api-examples' },
      ],
    },
    {
      text: 'react',
      items: [
        { text: 'Markdown Examples', link: '/react/markdown-examples' },
        { text: 'Runtime API Examples', link: '/react/api-examples' },
      ],
    },
    {
      text: 'sentry',
      items: [{ text: '前端接入sentry', link: '/sentry/addSentry' }],
    },
    {
      text: 'sass',
      items: [{ text: 'sass的基本使用', link: '/sass/baseUse' }],
    },
    {
      text: 'nginx',
      items: [{ text: '前端项目的打包部署上线全流程', link: '/backEnd/nginx/cicd' }],
    },
  ],
};

export default sidebar;
