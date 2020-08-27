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
      secondary: '#BDBDBD',
      accent: '#2C4027',
      info: '#4E7DA6',
      success: '#26A699',
      warning: '#F29727',
      error: '#F24C3D'
    },
    dark: {
      // primary: '#3FA8BF',
      // secondary: '#424242',
      // accent: '#D9B959',
      // info: '#3E8C76',
      // success: '#D9A86C',
      // warning: '#BF712C',
      // error: '#F24C3D'
      primary: '#D94625',
      secondary: '#424242',
      accent: '#2C4027',
      info: '#4E7DA6',
      success: '#26A699',
      warning: '#F29727',
      error: '#BF0426'
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
