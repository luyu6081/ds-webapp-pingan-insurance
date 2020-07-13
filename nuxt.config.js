// import path from 'path'
// import dotenv from 'dotenv'

// dotenv.config({
//   path: path.join(__dirname, process.env.NODE_ENV === 'development' ? '.env.local' : '.env.production'),
// })

module.exports = {
  srcDir: 'client/',
  mode: 'spa',
  router: {
    middleware: 'auth',
  },
  head: {
    title: '数据标准', // 海盒
    meta: [
      {charset: 'utf-8'},
      {'http-equiv': 'X-UA-Compatible', content: 'IE=edge'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
    ],
    link: [
      {rel: 'icon', type: 'image/x-icon', href: '/favicon.png'},
    ],
  },
  loading: {color: '#fff', duration: 2000},
  css: [
    'element-ui/lib/theme-chalk/index.css',
    '~/assets/base.scss',
    '~/assets/reset-element-ui.scss',
  ],
  plugins: [
    {src: '~/plugins/vue-composition-api'},
    {src: '~/plugins/svg4everybody', mode: 'client'},
  ],
  buildModules: [
    '@nuxtjs/router',
  ],
  modules: [
    // '@nuxtjs/proxy',
    '@ej/app-nuxt-module',
    '~/modules/runtime-args',
  ],
  // proxy: {
  //   '/graphql': {
  //     target: process.env.NUXT_ENV_HTTP_ENDPOINT || '/',
  //     changeOrigin: true,
  //     ws: true,
  //   },
  //   '/auth': {
  //     target: process.env.NUXT_ENV_AUTH_HTTP_ENDPOINT || '/',
  //     changeOrigin: true,
  //   },
  // },
  apollo: {
    clientConfigs: {
      default: '~/apollo/client-configs/default-config.js',
      notify: '~/apollo/client-configs/notify-config.js',
      apolloUserClient: '~/apollo/client-configs/default-config.js',
    },
  },
  serverMiddleware: [
    {
      path: '/runtime-args.json',
      handler (req, res, next) {
        res.end(JSON.stringify(require('./runtime-args.dev')))
      },
    },
  ],
  /*
  ** Build configuration
  */
  build: {
    postcss: {
      plugins: {
        tailwindcss: './tailwind.config.js',
        'postcss-easings': {},
        autoprefixer: {},
      },
    },
    transpile: [
      '@ej/',
      'vue-echarts',
      'resize-detector',
    ],
    extend (config, {isDev}) {
      // config.devtool = isDev ? 'cheap-module-eval-source-map' : false
      config.devtool = isDev ? 'eval-source-map' : false

      // console.log(JSON.stringify(config, (key, val) => {
      //   if (val instanceof RegExp) return val.toString()
      //   else return val
      // }, 2))
    },
  },
}
