<template>
  <v-container fluid>
    <v-form>
      <v-card :loading="loading">
        <v-toolbar color="accent" dense flat dark>
          <v-toolbar-title>게시판 정보 작성</v-toolbar-title>
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
      if (this.unsubscribe) this.unsubscribe()
      this.ref = this.$firebase.firestore().collection('boards').doc(this.document)
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
      if (!this.$store.state.fireUser) throw Error('로그인이 필요합니다')
      const form = {
        category: this.form.category,
        title: this.form.title,
        description: this.form.description,
        updatedAt: new Date()
      }
      this.loading = true
      try {
        if (!this.exists) {
          form.createdAt = new Date()
          form.count = 0
          form.uid = this.$store.state.fireUser.uid
          await this.ref.set(form)
        } else {
          await this.ref.update(form)
        }
        this.$router.push('/board/' + this.document)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
