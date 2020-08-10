<template>
  <v-container fluid v-if="!loaded">
    <v-skeleton-loader type="article"></v-skeleton-loader>
  </v-container>
  <v-container fluid v-else-if="loaded && !board">
    <v-alert type="warning" border="left" class="mb-0">
      게시판 정보를 불러오지 못했습니다
    </v-alert>
  </v-container>
  <v-container v-else fluid :class="$vuetify.breakpoint.xs ? 'pa-0' : ''">
    <form-normal
      v-if="board.type === '일반'"
      :boardId="boardId"
      :articleId="articleId"
      :action="action"
      :board="board" />
    <form-gallery
      v-else
      :boardId="boardId"
      :articleId="articleId"
      :action="action"
      :board="board" />
  </v-container>
</template>
<script>
import FormNormal from './components/form-normal'
import FormGallery from './components/form-gallery'

export default {
  components: { FormNormal, FormGallery },
  props: ['boardId', 'articleId', 'action'],
  data () {
    return {
      loading: false,
      board: null,
      loaded: false
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    fireUser () {
      return this.$store.state.fireUser
    }
  },
  watch: {
    boardId () {
      this.fetch()
    },
    articleId () {
      this.fetch()
    },
    action () {
      this.fetch()
    }
  },
  created () {
    this.fetch()
  },
  mounted () {
  },
  destroyed () {
  },
  methods: {
    async fetch () {
      this.board = null
      const ref = this.$firebase.firestore()
        .collection('boards').doc(this.boardId)
      this.loaded = false
      const doc = await ref.get()
      this.loaded = true
      if (doc.exists) this.board = doc.data()
    }
  }
}
</script>
