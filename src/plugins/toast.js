import Vue from 'vue'
import Toasted from 'vue-toasted'

Vue.use(Toasted, {
  iconPack: 'mdi',
  position: 'bottom-right'
})

Vue.toasted.register('notice', (payload) => {
  return payload
}, {
  icon: 'mdi-bell',
  position: 'bottom-right',
  duration: 4000,
  className: 'subheading',
  action: {
    text: '닫기',
    onClick: (e, toastObject) => {
      toastObject.goAway(0)
    }
  }
})

Vue.toasted.register('error', (payload) => {
  return payload
}, {
  icon: 'mdi-alert',
  // position: 'bottom-right',
  duration: 8000,
  className: 'text--primary',
  action: {
    text: '닫기',
    onClick: (e, toastObject) => {
      toastObject.goAway(0)
    }
  }
})
