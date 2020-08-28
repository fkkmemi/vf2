import Vue from 'vue'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firebase-database'
import 'firebase/firebase-firestore'
import 'firebase/firebase-storage'
import 'firebase/analytics'
import firebaseConfig from '../../firebaseConfig'
import store from '../store/'

firebase.initializeApp(firebaseConfig)
firebase.auth().languageCode = 'ko'
firebase.analytics()

let unsubscribe = null

const subscribe = async (fu) => {
  const ref = firebase.firestore().collection('users').doc(fu.uid)
  await ref.update({
    visitedAt: new Date(),
    visitCount: firebase.firestore.FieldValue.increment(1)
  }).catch(e => console.error('visit update err: ' + e.message))
  unsubscribe = ref.onSnapshot(doc => {
    if (doc.exists) {
      const user = doc.data()
      user.uid = fu.uid
      if (user.providerId === 'password') {
        const set = {}
        if (!user.displayName) {
          let displayName = fu.displayName || '손님'
          const userDisplayName = localStorage.getItem('userDisplayName')
          if (userDisplayName) {
            displayName = userDisplayName
            localStorage.removeItem('userDisplayName')
          }
          user.displayName = displayName
          set.displayName = displayName
        }
        if (user.emailVerified !== fu.emailVerified) {
          set.emailVerified = fu.emailVerified
        }
        if (Object.keys(set).length) ref.update(set)
      } else {
        if (!fu.emailVerified) {
          console.log('getIdToken true')
          firebase.auth().currentUser.getIdToken(true)
        }
      }
      // user.emailVerified = false
      store.commit('setUser', user)
      // console.log('user subscribe: ' + user)
    }
  }, console.error)
}

firebase.auth().onAuthStateChanged((fu) => {
  // console.log('user evnet: ' + JSON.stringify(fu, null, 2))
  store.commit('setFireUser', fu)
  if (!fu) {
    store.commit('setUser', null)
    if (unsubscribe) unsubscribe()
    return
  }
  subscribe(fu)
})

Vue.prototype.$firebase = firebase
