import Vue from 'vue'

Vue.config.errorHandler = e => {
  console.error(e.message)
  Vue.prototype.$toast.error(e.message)
  console.log('here')
}
