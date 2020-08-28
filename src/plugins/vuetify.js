import Vue from 'vue'
import Vuetify, { VSnackbar, VBtn, VIcon } from 'vuetify/lib'

import en from 'vuetify/es5/locale/en'
import ko from 'vuetify/es5/locale/ko'
import constants from '@/util/constants'

Vue.use(Vuetify, {
  components: {
    VSnackbar,
    VBtn,
    VIcon
  }
})

const themes = JSON.parse(localStorage.getItem('site-themes')) || constants.themes
const theme = {
  dark: !!JSON.parse(localStorage.getItem('site-theme-dark')),
  themes: themes
}
const VuetifyObj = new Vuetify({
  lang: {
    locales: { en, ko },
    current: 'ko'
  },
  theme
})

export default VuetifyObj
