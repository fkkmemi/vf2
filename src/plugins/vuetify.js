import Vue from 'vue'
import Vuetify, { VSnackbar, VBtn, VIcon } from 'vuetify/lib'
import VuetifyToast from 'vuetify-toast-snackbar'

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
  themes: {
    light: {
      primary: '#344059',
      secondary: '#BFBFBF', // #FFCDD2
      accent: '#2C4027',
      info: '#4E7DA6'
      // success: '#2C4027'
    }
    // dark: {
    //   primary: colors.brown.darken1, // #E53935
    //   secondary: colors.deepPurple.lighten4, // #FFCDD2
    //   accent: colors.indigo.base // #3F51B5
    // }
  }
}
const VuetifyObj = new Vuetify({
  lang: {
    locales: { en, ko },
    current: 'ko'
  },
  theme
})
Vue.use(VuetifyToast, {
  x: 'right', // default
  y: 'bottom', // default
  color: 'info', // default
  icon: 'mdi-information',
  iconColor: '', // default
  classes: [
    'body-2'
  ],
  timeout: 3000, // default
  dismissable: true, // default
  multiLine: false, // default
  vertical: false, // default
  queueable: false, // default
  showClose: false, // default
  closeText: '', // default
  closeIcon: 'close', // default
  closeColor: '', // default
  slot: [], // default
  shorts: {
    custom: {
      color: 'purple'
    }
  },
  property: '$toast', // default
  $vuetify: VuetifyObj.framework
})

export default VuetifyObj
