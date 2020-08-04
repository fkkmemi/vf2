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
  themes: {
    light: {
      primary: '#344059',
      secondary: '#BFBFBF', // #FFCDD2
      accent: '#2C4027',
      info: '#4E7DA6',
      success: '#26A699',
      warning: '#F29727',
      error: '#F24C3D'

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

export default VuetifyObj
