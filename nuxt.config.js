import pkg from './package'

export default {
  mode: 'spa',

  buildDir: __dirname + '/.nuxt',

  dir: {
    static: __dirname + '/static'
  },

  /*
  ** Headers of the page
  */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff' },

  /*
  ** Global CSS
  */
  css: [
    'element-ui/lib/theme-chalk/index.css'
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '@/plugins/element-ui',
    '@/plugins/lodash',
    '@/plugins/api'
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
  ],

  /*
  ** Axios module configuration
  */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
    debug: false,
    proxy: false
  },

  /*proxy: {
    // See https://axios.nuxtjs.org/options, https://github.com/nuxt-community/proxy-module
    '/api': {
      target: 'http://fake', // get the target in router
      pathRewrite: { '^/api/' : '/' },
      //pathRewrite: { '^/api/' : function (path, req) { 
      //  return path.replace('/api', '/')
      //}},
      router: function(req) {
        var route = req.url.substring(req.url.indexOf('?') + 1)
        return route
      }
    }
  },*/

  serverMiddleware: [
    '~/serverMiddleware/pulsar-api-proxy'
  ],

  /*
  ** Build configuration
  */
  build: {
    transpile: [/^element-ui/],
    
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
    }
  }
}
