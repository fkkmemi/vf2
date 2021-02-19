import Vue from 'vue'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firebase-database'
import 'firebase/firebase-firestore'
import 'firebase/firebase-storage'
import firebaseConfig from '../../firebaseConfig'
import store from '../store/'

firebase.initializeApp(firebaseConfig)
firebase.auth().languageCode = 'ko'

let unsubscribe = null

const subscribe = (fu) => {
  const ref = firebase.firestore().collection('users').doc(fu.uid)
  unsubscribe = ref.onSnapshot(doc => {
    if (doc.exists) {
      const user = doc.data()
      user.uid = fu.uid
      if (!user.displayName) user.displayName = fu.displayName || '손님'
      if (!user.photoURL) user.photoURL = fu.photoURL || '/user.png'
      store.commit('setUser', user)
    }
  }, console.error)
}

firebase.auth().onAuthStateChanged((fu) => {
  store.commit('setFireUser', fu)
  if (!fu) {
    store.commit('setUser', null)
    if (unsubscribe) unsubscribe()
    return
  }
  subscribe(fu)
})

Vue.prototype.$firebase = firebase
