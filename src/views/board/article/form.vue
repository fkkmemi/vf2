<template>
  <v-container fluid>
    <v-form>
      <v-card :loading="loading">
        <v-toolbar color="accent" dense flat dark>
          <v-toolbar-title>게시판 글 작성</v-toolbar-title>
        <v-spacer/>
        <v-btn icon @click="$router.push('/board/' + document)"><v-icon>mdi-arrow-left</v-icon></v-btn>
        <v-btn icon @click="save" :disabled="!user"><v-icon>mdi-content-save</v-icon></v-btn>
        </v-toolbar>
        <v-card-text>
          <v-text-field v-model="form.title" outlined label="제목"></v-text-field>
          <editor v-if="!articleId" :initialValue="form.content" ref="editor" initialEditType="wysiwyg" :options="{ hideModeSwitch: true }"></editor>
          <template v-else>
            <editor v-if="form.content" :initialValue="form.content" ref="editor" initialEditType="wysiwyg" :options="{ hideModeSwitch: true }"></editor>
            <v-container v-else>
              <v-row justify="center" align="center">
                <v-progress-circular indeterminate></v-progress-circular>
              </v-row>
            </v-container>
          </template>
        </v-card-text>
      </v-card>
    </v-form>
  </v-container>
</template>
<script>
import axios from 'axios'

export default {
  props: ['document', 'action'],
  data () {
    return {
      form: {
        title: '',
        content: ''
      },
      exists: false,
      loading: false,
      ref: null
    }
  },
  computed: {
    articleId () {
      return this.$route.query.articleId
    },
    user () {
      return this.$store.state.user
    },
    fireUser () {
      return this.$store.state.fireUser
    }
  },
  watch: {
    document () {
      this.fetch()
    }
  },
  created () {
    this.fetch()
  },
  destroyed () {
  },
  methods: {
    async fetch () {
      this.ref = this.$firebase.firestore().collection('boards').doc(this.document)
      if (!this.articleId) return
      const doc = await this.ref.collection('articles').doc(this.articleId).get()
      this.exists = doc.exists
      if (!this.exists) return
      const item = doc.data()
      this.form.title = item.title
      const { data } = await axios.get(item.url)
      this.form.content = data
    },
    async save () {
      if (!this.fireUser) throw Error('로그인이 필요합니다')
      this.loading = true
      try {
        const createdAt = new Date()
        const id = createdAt.getTime().toString()
        const md = this.$refs.editor.invoke('getMarkdown')
        const sn = await this.$firebase.storage().ref().child('boards').child(this.document).child(id + '.md').putString(md)
        const url = await sn.ref.getDownloadURL()
        const doc = {
          title: this.form.title,
          updatedAt: createdAt,
          url: url
        }

        // const batch = await this.$firebase.firestore().batch()

        if (!this.articleId) {
          doc.createdAt = createdAt
          doc.commentCount = 0
          doc.readCount = 0
          doc.uid = this.$store.state.fireUser.uid
          doc.user = {
            email: this.user.email,
            photoURL: this.user.photoURL,
            displayName: this.user.displayName
          }
          // batch.set(this.ref.collection('articles').doc(id), doc)
          // batch.update(this.ref, { count: this.$firebase.firestore.FieldValue.increment(1) })
          this.ref.collection('articles').doc(id).set(doc)
        } else {
          // batch.update(this.ref.collection('articles').doc(this.articleId), doc)
          this.ref.collection('articles').doc(this.articleId).update(doc)
        }
        // await batch.commit()
      } finally {
        this.loading = false
        this.$router.push('/board/' + this.document)
      }
    }
  }
}
</script>
