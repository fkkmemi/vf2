import Vue from 'vue'
import Vuetify, { VSnackbar, VBtn, VIcon } from 'vuetify/lib'

import en from 'vuetify/es5/locale/en'
import ko from 'vuetify/es5/locale/ko'

Vue.use(Vuetify, {
  components: {
    VSnackbar,
    VBtn,
    VIcon
  }
})
const theme = {
  dark: !!JSON.parse(localStorage.getItem('site-theme-dark')),
  themes: {
    light: {
      primary: '#344059',
      secondary: '#BFBFBF',
      accent: '#2C4027',
      info: '#4E7DA6',
      success: '#26A699',
      warning: '#F29727',
      error: '#F24C3D'
    },
    dark: {
      primary: '#3FA8BF',
      secondary: '#BFBFBF',
      accent: '#3E8C76',
      info: '#D9B959',
      success: '#D9A86C',
      warning: '#BF712C',
      error: '#F24C3D'
    }
  }
}
const VuetifyObj = new Vuetify({
  lang: {
    locales: { en, ko },
    current: 'ko'
  },
  theme
})

export default VuetifyObj
