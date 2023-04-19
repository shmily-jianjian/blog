import { DefaultTheme } from 'vitepress';

const nav: DefaultTheme.NavItem[] = [
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
    text: '工程化',
    items: [
      {
        text: 'webpack',
        link: '/react/markdown-examples',
      },
      {
        text: 'babel',
        link: '/engineering/babel/babel-plugin',
      },
      {
        text: 'ast',
        link: '/engineering/ast/ast-base',
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
];

export default nav;
