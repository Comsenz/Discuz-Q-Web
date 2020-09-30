import enLocale from './plugins/lang/en.js'
import zhLocale from './plugins/lang/zh.js'

const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

// const API_URL = 'https://discuz.chat'
const API_URL_DEV = 'https://dq.comsenz-service.com'

const isProduction = process.env.NODE_ENV === 'production'

const proxyConfig = {
  '/api': {
    target: API_URL_DEV, // 目标服务器
    changeOrigin: true
  }
}
const plugins = [
  ['component',
    {
      'libraryName': 'element-ui',
      'styleLibraryName': 'theme-chalk'
    }
  ]
]
//  生产环境清除log
if (isProduction) {
  plugins.push('transform-remove-console')
}
export default {
  env: {
    domain: process.env.VUE_APP_CONFIG_API_URL || API_URL_DEV,
    baseURL: '/'
  },
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
    // title: process.env.npm_package_name || '',
    title: 'Discuz! Q',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  router: {
    middleware: 'header',
    routeNameSplitter: '/'
  },
  /*
  ** Global CSS
  */
  css: [
    'element-ui/lib/theme-chalk/index.css',
    '@/assets/css/reset.scss',
    'vditor/src/assets/scss/index.scss',
    'viewerjs/dist/viewer.css'
  ],
  /*
  ** Plugins to load before mounting the App
  ** https://nuxtjs.org/guide/plugins
  */
  plugins: [
    '@/plugins/element-ui',
    '@/plugins/svg-icon',
    '@/directive/permission',
    '@/plugins/route',
    { src: '@/plugins/cropper', ssr: false },
    { src: '@/plugins/viewer', ssr: false },
    { src: '@/plugins/dzqjs', ssr: false }
  ],
  /*
  ** Auto import components
  ** See https://nuxtjs.org/api/configuration-components
  */
  components: true,
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [],
  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/axios',
    'nuxt-i18n',
    '@nuxtjs/proxy'
  ],
  generate: {
    routes: ['/pages/invite/index', '/pages/manage/index', '/pages/site/index']
  },
  i18n: {
    // locales: ['en', 'zh'],
    defaultLocale: 'zh',
    vueI18n: {
      fallbackLocale: 'zh',
      messages: {
        // en: {
        //   ...enLocale
        // },
        zh: {
          ...zhLocale
        }
      }
    }
  },

  axios: {
    // proxyHeaders: false
    proxy: !isProduction
  },
  proxy: isProduction ? {} : proxyConfig, // 生产环境会一直运行
  /*
  ** Build configuration
  ** See https://nuxtjs.org/api/configuration-build/
  */
  build: {
    // analyze: true,
    // 生产环境抽离css
    extractCSS: isProduction,
    optimization: {
      splitChunks: {
        cacheGroups: {
          styles: {
            name: 'styles',
            test: /\.(css|vue|scss)$/,
            chunks: 'all',
            enforce: true
          }
        }
      }
    },
    // transpile: [/^element-ui/],
    // element 按需加载
    babel: {
      plugins: plugins,
      presets({ isServer }) {
        const targets = isServer ? { node: '10' } : { ie: '11' }
        return [[require.resolve('@nuxt/babel-preset-app'), { targets }]]
      }
    },
    // svg处理
    extend(config, context) {
      // 生成环境清除log
      // if (context.isClient && !context.isDev) {
      // config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
      // }

      // Run ESLint on save
      if (context.isDev && context.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }

      // 排除 nuxt 原配置的影响,Nuxt 默认有vue-loader,会处理svg,img等
      // 找到匹配.svg的规则,然后将存放svg文件的目录排除
      const svgRule = config.module.rules.find(rule => rule.test.test('.svg'))
      svgRule.exclude = [resolve('assets/svg-icons')]

      // 添加loader规则
      config.module.rules.push({
        test: /\.svg$/, // 匹配.svg
        include: [resolve('assets/svg-icons')], // 将存放svg的目录加入到loader处理目录
        use: [{ loader: 'svg-sprite-loader', options: { esModule: false }}]
      })
    }
  }
}
