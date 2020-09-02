import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    editable: false,
    fireUser: null,
    user: null,
    boardTypeList: localStorage.getItem('boardTypeList') === 'true',
    cached: {},
    site: null
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
    setCached (state, { boardId, lastDoc, items, articleId }) {
      if (!state.cached[boardId]) state.cached[boardId] = {}
      const cached = state.cached[boardId]
      cached.lastDoc = lastDoc
      cached.items = items
      if (articleId !== undefined) cached.articleId = articleId
    },
    setCachedItem (state, { boardId, articleId }) {
      if (!state.cached[boardId]) state.cached[boardId] = {}
      const cached = state.cached[boardId]
      cached.articleId = articleId
      const key = `${boardId}-${articleId}-read`
      const readVal = JSON.parse(localStorage.getItem(key))
      const read = readVal ? readVal + 1 : 1
      localStorage.setItem(key, read)
      if (!cached.items) return
      const findItem = cached.items.find(item => item.id === articleId)
      if (findItem) findItem.read = read
    },
    setSite (state, site) {
      state.site = site
    },
    setSiteCards (state, cards) {
      if (!state.site) return
      state.site.cards = cards
    }
  },
  actions: {
  },
  modules: {
  }
})
