import Vue from 'vue'
import store from './store'

Vue.config.errorHandler = e => {
  const toast = Vue.prototype.$toasted.global
  console.error(e)
  if (e.code === 'permission-denied') {
    if (!store.state.user) return toast.error('로그인이 필요합니다')
    if (!store.state.user.emailVerified) return toast.error('이메일 확인이 필요합니다')
    toast.error('권한이 없습니다')
    return
  }
  toast.error(e.message)
}
