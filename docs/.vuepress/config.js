module.exports = {
    title: 'AC:NH Inside',
    locales: {
        '/': {
            lang: 'zh-CN'
          }
    },
    themeConfig: {
        //displayAllHeaders: true,
        sidebar: [
            '/',
            {
                title: '文件格式',
                path: '/file/',
                children: [
                    '/file/bcsv'
                ]
            },
            {
                title: '专题资料',
                path: '/topic/',
                children: [
                    '/topic/turnip'
                ]
            },
            {
                title: '附录',
                path: '/appendix/',
                children: [
                    '/appendix/extract_nsp'
                ]
            },
        ]
      }
  }