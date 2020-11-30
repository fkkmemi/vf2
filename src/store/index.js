import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    editable: false,
    fireUser: null,
    user: null,
    boardTypeList: localStorage.getItem('boardTypeList') === 'true',
    searchText: ''
  },
  mutations: {
    setEdit (state, edit) {
      state.editable = edit
    },
    setFireUser (state, fu) {
      state.fireUser = fu
    },
    setUser (state, user) {
      state.user = user
    },
    toggleBoardType (state) {
      state.boardTypeList = !state.boardTypeList
      localStorage.setItem('boardTypeList', state.boardTypeList)
    },
    setSearchText (state, text) {
      state.searchText = text
    }
  },
  actions: {
  },
  modules: {
  }
})
