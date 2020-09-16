module.exports = {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            // Requires sass-loader@^8.0.0
            options: {
              // This is the path to your variables
              prependData: "@import '@/styles/variables.scss';"
            }
          }
        ]
      }
    ]
  }
}
