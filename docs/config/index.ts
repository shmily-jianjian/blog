import { defineConfig } from 'vitepress';

export default defineConfig({
  title: '懒人博客',
  description: 'zhaojian的博客笔记',
  base: '/blog/',
  outDir: '../blog',
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/jpeg', href: 'http://zhaojian.shop/photo/logo.jpeg' }],
  ],
  appearance: 'dark',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.jpeg',
    algolia: {
      appId: '',
      apiKey: '',
      indexName: '',
    },
    nav: [
      {
        text: '前端',
        items: [
          {
            text: 'vue',
            link: '/vue/markdown-examples',
          },
          {
            text: 'react',
            link: '/react/markdown-examples',
          },
          {
            text: 'ts',
            link: '/react/markdown-examples',
          },
          {
            text: 'sass',
            link: '/sass/baseUse',
          },
        ],
      },
      {
        text: '后端',
        items: [
          {
            text: 'nginx',
            link: '/backEnd/nginx/cicd',
          },
          {
            text: 'node',
            link: '/backEnd/nginx/cicd',
          },
        ],
      },
      { text: '面试题', link: '/markdown-examples' },
    ],
    sidebar: {
      '/': [
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
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/vuejs/vitepress' }],
  },
});
