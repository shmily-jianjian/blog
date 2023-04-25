import { DefaultTheme } from 'vitepress';

const sidebar: DefaultTheme.Sidebar = {
  '/webpack': [
    {
      text: 'webpack',
      items: [
        { text: 'webpack的基本使用', link: '/webpack/baseUse' },
        { text: 'webpack的打包结果分析', link: '/webpack/buildAnalysis' },
        { text: '配置文件如何能有类型提示', link: '/webpack/typeTips' },
        { text: 'webpack优化分析', link: '/webpack/webpackOptimize' },
      ],
    },
  ],
  '/babel': [
    {
      text: 'babel',
      items: [
        { text: 'babel插件并在vue项目使用', link: '/babel/babel-plugin' },
        { text: '简单实现几个简单babek插件', link: '/babel/babel-plugin-others' },
      ],
    },
  ],
  '/ast': [
    {
      text: 'ast',
      items: [{ text: 'ast的基本使用', link: '/ast/ast-base' }],
    },
  ],
  '/backEnd': [
    {
      text: 'nginx',
      items: [{ text: '前端项目的打包部署上线全流程', link: '/backEnd/nginx/cicd' }],
    },
  ],
  '/sass': [
    {
      text: 'sass',
      items: [{ text: 'sass的基本使用', link: '/sass/baseUse' }],
    },
  ],
  '/sentry': [
    {
      text: 'sentry',
      items: [{ text: '前端接入sentry', link: '/sentry/addSentry' }],
    },
  ],
};

export default sidebar;
