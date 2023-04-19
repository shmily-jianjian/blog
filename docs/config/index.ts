import { defineConfig } from 'vitepress';
import nav from './nav';
import sidebar from './sidebar';

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
    nav,
    sidebar,
    socialLinks: [{ icon: 'github', link: 'https://github.com/shmily-jianjian/blog' }],
  },
});
