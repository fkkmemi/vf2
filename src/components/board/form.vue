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
    <v-form>
      <v-card :loading="loading" outlined :tile="$vuetify.breakpoint.xs">
        <v-toolbar color="transparent" dense flat>
          <v-toolbar-title>게시물 작성</v-toolbar-title>
          <v-spacer/>
          <v-btn icon @click="save" :disabled="!user"><v-icon>mdi-content-save</v-icon></v-btn>
          <v-btn icon @click="$router.push('/board/' + boardId)"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-divider/>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="2" v-if="board">
              <v-select
                v-model="form.important"
                :items="[
                  { value: 0, text: '일반'},
                  { value: 1, text: '공지'},
                  { value: 2, text: '중요'}
                ]"
                label="유형"
                outlined hide-details />
            </v-col>
            <v-col cols="12" sm="4" v-if="board">
              <v-combobox
                v-model="form.category"
                :items="board.categories"
                label="종류"
                outlined hide-details />
            </v-col>
            <v-col cols="12" sm="6" v-if="board">
              <v-combobox
                v-model="form.tags"
                :items="board.tags"
                label="태그"
                outlined
                multiple
                small-chips hide-details />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="form.title" outlined label="제목" hide-details></v-text-field>
            </v-col>
            <v-col cols="12">
              <editor
                v-if="!exists"
                :initialValue="form.content"
                ref="editor" initialEditType="wysiwyg" height="400px"
                :options="options"
                ></editor>
              <template v-else>
                <editor
                  v-if="form.content"
                  :initialValue="form.content"
                  ref="editor" initialEditType="wysiwyg" height="400px"
                  :options="options"></editor>
                <v-container v-else>
                  <v-row justify="center" align="center">
                    <v-progress-circular indeterminate></v-progress-circular>
                  </v-row>
                </v-container>
              </template>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider/>
        <v-card-actions>
          <v-spacer/>
          <v-btn text @click="$router.push('/board/' + boardId)"><v-icon left>mdi-close</v-icon>취소</v-btn>
          <v-btn @click="save" :disabled="!user" text color="primary">
            <v-icon left>mdi-content-save</v-icon> 저장
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-container>
</template>
<script>
import axios from 'axios'
import getSummary from '@/util/getSummary'
import imageCompress from '@/util/imageCompress'

export default {
  props: ['boardId', 'articleId', 'action'],
  data () {
    return {
      form: {
        category: '',
        tags: [],
        title: '',
        content: '',
        images: [],
        important: 0
      },
      exists: false,
      loading: false,
      ref: null,
      article: null,
      board: null,
      loaded: false,
      options: {
        language: 'ko',
        hooks: {
          addImageBlobHook: this.addImageBlobHook
        }
      },
      plugins: [
        [this.youtubePlugin]

      ]
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
      this.ref = this.$firebase.firestore().collection('boards').doc(this.boardId)
      this.loaded = false
      const docBoard = await this.ref.get()
      this.loaded = true
      this.board = docBoard.data()
      const doc = await this.ref.collection('articles').doc(this.articleId).get()
      this.exists = doc.exists
      if (!this.exists) return
      const item = doc.data()
      this.article = item
      this.form.title = item.title
      this.form.category = item.category
      this.form.tags = item.tags
      this.form.images = item.images
      if (!item.images) this.form.images = []
      this.form.important = item.important
      const { data } = await axios.get(item.url)
      this.form.content = typeof data === 'string' ? data : data.toString()
    },
    async save () {
      if (!this.fireUser) throw Error('로그인이 필요합니다')
      if (!this.form.category) throw Error('종류는 필수 항목입니다')
      if (!this.form.title) throw Error('제목은 필수 항목입니다')
      const md = this.$refs.editor.invoke('getMarkdown')
      if (!md) throw Error('내용은 필수 항목입니다')
      this.loading = true
      try {
        const doc = {
          title: this.form.title,
          category: this.form.category,
          tags: this.form.tags,
          images: this.findImagesFromDoc(md, this.form.images), // this.form.images,
          updatedAt: new Date(),
          summary: getSummary(md, 300, 'data:image'),
          important: this.form.important
        }
        if (!this.exists) {
          const fn = this.articleId + '-' + this.fireUser.uid + '.md'
          const sn = await this.$firebase.storage().ref().child('boards').child(this.boardId).child(fn).putString(md)
          doc.url = await sn.ref.getDownloadURL()
          doc.createdAt = new Date()
          doc.commentCount = 0
          doc.readCount = 0
          doc.uid = this.$store.state.fireUser.uid
          doc.user = {
            email: this.user.email,
            photoURL: this.user.photoURL,
            displayName: this.user.displayName
          }
          doc.likeCount = 0
          doc.likeUids = []
          await this.ref.collection('articles').doc(this.articleId).set(doc)
          this.exists = true
          this.$router.push('/board/' + this.boardId)
        } else {
          const fn = this.articleId + '-' + this.article.uid + '.md'
          await this.$firebase.storage().ref().child('boards').child(this.boardId).child(fn).putString(md)
          await this.ref.collection('articles').doc(this.articleId).update(doc)
          this.$router.push(this.$route.path)
        }
      } finally {
        this.loading = false
      }
    },
    findImagesFromDoc (md, images) {
      const filteredImages = images.filter(image => {
        return md.indexOf(image.url) >= 0
      })
      return filteredImages
    },
    async imageUpload (file) {
      if (!this.fireUser) throw Error('로그인이 필요합니다')
      const thumbnail = await imageCompress(file)
      const image = {
        size: file.size,
        id: '',
        url: '',
        thumbSize: thumbnail.size,
        thumbId: '',
        thumbUrl: ''
      }

      image.id = new Date().getTime() + '-' + this.fireUser.uid + '-' + file.name
      const sn = await this.$firebase.storage().ref()
        .child('images').child('boards')
        .child(this.boardId).child(this.articleId).child(image.id)
        .put(file)
      image.url = await sn.ref.getDownloadURL()

      image.thumbId = new Date().getTime() + '-' + this.fireUser.uid + '-thumb-' + file.name
      const snt = await this.$firebase.storage().ref()
        .child('images').child('boards')
        .child(this.boardId).child(this.articleId).child(image.thumbId)
        .put(thumbnail)
      image.thumbUrl = await snt.ref.getDownloadURL()

      this.form.images.push(image)
      return image
    },
    addImageBlobHook (blob, callback) {
      this.imageUpload(blob)
        .then(image => {
          callback(image.url, 'img')
        })
        .catch(console.error)
    }
  }
}
</script>
