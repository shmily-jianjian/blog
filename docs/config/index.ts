import { defineConfig } from 'vitepress';

export default defineConfig({
  title: '懒人博客',
  description: 'zhaojian的博客笔记',
  base: '/blog/',
  outDir: '../dist',
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
        text: 'Web',
        items: [
          {
            text: 'Vue',
            link: '/',
          },
          {
            text: 'React',
            link: '/',
          },
        ],
      },
      { text: 'Node', link: '/markdown-examples' },
      { text: 'TS', link: '/markdown-examples' },
    ],
    sidebar: {
      '/react/': [
        {
          text: 'react',
          items: [
            { text: 'Markdown Examples', link: '/react/markdown-examples' },
            { text: 'Runtime API Examples', link: '/react/api-examples' },
          ],
        },
        {
          text: 'vue',
          items: [
            { text: 'Markdown Examples', link: '/vue/markdown-examples' },
            { text: 'Runtime API Examples', link: '/vue/api-examples' },
          ],
        },
      ],
      '/vue/': [
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
      ],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/vuejs/vitepress' }],
  },
});
