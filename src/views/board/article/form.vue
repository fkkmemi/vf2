<template>
  <v-container fluid>
    <v-form>
      <v-card :loading="loading">
        <v-toolbar color="accent" dense flat dark>
          <v-toolbar-title>게시판 글 작성</v-toolbar-title>
        <v-spacer/>
        <v-btn icon @click="$router.push('/board/' + document)"><v-icon>mdi-arrow-left</v-icon></v-btn>
        <v-btn icon @click="save"><v-icon>mdi-content-save</v-icon></v-btn>
        </v-toolbar>
        <v-card-text>
          <v-text-field v-model="form.category" outlined label="종류"></v-text-field>
          <v-text-field v-model="form.title" outlined label="제목"></v-text-field>
          <v-textarea v-model="form.description" outlined label="설명"></v-textarea>
        </v-card-text>
      </v-card>
    </v-form>
  </v-container>
</template>
<script>
export default {
  props: ['document', 'action'],
  data () {
    return {
      unsubscribe: null,
      form: {
        category: '',
        title: '',
        description: ''
      },
      exists: false,
      loading: false,
      ref: null
    }
  },
  computed: {
    articleId () {
      return this.$route.query.articleId
    }
  },
  watch: {
    document () {
      this.subscribe()
    }
  },
  created () {
    this.subscribe()
  },
  destroyed () {
    if (this.unsubscribe) this.unsubscribe()
  },
  methods: {
    subscribe () {
      console.log(this.articleId)
      if (this.articleId === 'new') return
      if (this.unsubscribe) this.unsubscribe()
      this.ref = this.$firebase.firestore().collection('boards').doc(this.document).collection('articles').doc(this.articleId)
      this.unsubscribe = this.ref.onSnapshot(doc => {
        this.exists = doc.exists
        if (this.exists) {
          const item = doc.data()
          this.form.category = item.category
          this.form.title = item.title
          this.form.description = item.description
        }
      })
    },
    async save () {

    }
  }
}
</script>
