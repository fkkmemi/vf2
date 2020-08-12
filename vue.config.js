module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  chainWebpack: (config) => {
    config
      .plugin('html')
      .tap((args) => {
        args[0].title = process.env.VUE_APP_SITE_TITLE
        args[0].description = process.env.VUE_APP_SITE_DESCRIPTION
        args[0].image = process.env.VUE_APP_SITE_IMAGE
        return args
      })
  }
}
