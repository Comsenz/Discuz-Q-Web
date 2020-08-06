
const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}

export default {
  /*
  ** Nuxt rendering mode
  ** See https://nuxtjs.org/api/configuration-mode
  */
  mode: 'universal',
  /*
  ** Nuxt target
  ** See https://nuxtjs.org/api/configuration-target
  */
  target: 'server',
  /*
  ** Headers of the page
  ** See https://nuxtjs.org/api/configuration-head
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Global CSS
  */
  css: [
    'element-ui/lib/theme-chalk/index.css',
    '@/src/assets/sass/reset.scss'
  ],
  /*
  ** Plugins to load before mounting the App
  ** https://nuxtjs.org/guide/plugins
  */
  plugins: [
    '@/plugins/element-ui',
    '@/plugins/svg-icon'
  ],
  /*
  ** Auto import components
  ** See https://nuxtjs.org/api/configuration-components
  */
  components: true,
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
  ],
  /*
  ** Nuxt.js modules
  */
   modules: [
    '@nuxtjs/axios',
  ],
  axios: {
    // proxyHeaders: false
  },
  /*
  ** Build configuration
  ** See https://nuxtjs.org/api/configuration-build/
  */
  build: {
    // transpile: [/^element-ui/],
    // element 按需加载
    babel: {
      plugins: [
        [ "component", 
          {
            "libraryName": "element-ui",
            "styleLibraryName": "theme-chalk"
          }
        ] 
      ] 
    },
    // svg处理
    extend(config,context){
      // config.module.rule('svg').uses.clear()
      // config.module
      //   .rule('svg-sprite-loader')
      //   .test(/\.svg$/)
      //   .include.add(resolve('~assets/svg-icons')) // 处理svg目录
      //   .end()
      //   .use('svg-sprite-loader')
      //   .loader('svg-sprite-loader')
      //   .options({
      //     esModule: false
      //   })
      // 排除 nuxt 原配置的影响,Nuxt 默认有vue-loader,会处理svg,img等
      // 找到匹配.svg的规则,然后将存放svg文件的目录排除
      const svgRule = config.module.rules.find(rule => rule.test.test('.svg'))
      svgRule.exclude = [resolve('assets/svg-icons')]

      //添加loader规则
      config.module.rules.push({
          test: /\.svg$/, //匹配.svg
          include: [resolve('assets/svg-icons')], //将存放svg的目录加入到loader处理目录
          use: [{ loader: 'svg-sprite-loader',options: { esModule: false } }]
      })
    }
  }
}
