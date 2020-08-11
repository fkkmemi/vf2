<template>
  <v-form>
    <v-card :loading="loading" outlined :tile="$vuetify.breakpoint.xs">
      <v-toolbar color="transparent" dense flat>
        <v-toolbar-title>겔러리 게시물 작성</v-toolbar-title>
        <v-spacer/>
        <v-btn icon @click="save" :disabled="!user"><v-icon>mdi-content-save</v-icon></v-btn>
        <v-btn icon @click="$router.push('/board/' + boardId)"><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>
      <v-divider/>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="2">
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
          <v-col cols="12" sm="4">
            <v-combobox
              v-model="form.category"
              :items="board.categories"
              label="종류"
              outlined hide-details />
          </v-col>
          <v-col cols="12" sm="6">
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
          <v-col cols="12" sm="6">
            <v-row no-gutters justify="center" align="center">
              <v-col cols="12">
                <v-file-input
                  v-model="file"
                  prepend-inner-icon="mdi-image-plus"
                  prepend-icon="" label="이미지 첨부"
                  outlined
                  @change="imageUpload" />
              </v-col>
              <v-col cols="5">
                <v-divider/>
              </v-col>
              <v-col cols="2" class="text-center">
                또는
              </v-col>
              <v-col cols="5">
                <v-divider/>
              </v-col>
              <v-col cols="12" class="mt-6">
                <v-text-field
                  v-model="form.content"
                  outlined label="혹은 이미지 경로"
                  clearable
                  hide-details />
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" sm="6">
            <v-img v-if="form.content" :src="form.content"></v-img>
            <v-alert v-else border="left" type="info">이미지 없음</v-alert>
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
</template>
<script>
import axios from 'axios'
import imageCompress from '@/util/imageCompress'
import setMdFromImageUrl from '@/util/setMdFromImageUrl'
import getImageUrlFromMd from '@/util/getImageUrlFromMd'

export default {
  props: ['boardId', 'articleId', 'action', 'board'],
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
      loaded: false,
      file: null
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    fireUser () {
      return this.$store.state.fireUser
    },
    viewImage () {
      return getImageUrlFromMd(this.form.content)
    }

  },
  // watch: {
  //   board () {
  //     this.fetch()
  //   }
  // },
  created () {
    this.fetch()
  },
  mounted () {
  },
  destroyed () {
  },
  methods: {
    async fetch () {
      this.ref = this.$firebase.firestore()
        .collection('boards').doc(this.boardId)
        .collection('articles').doc(this.articleId)
      const doc = await this.ref.get()
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
      const md = typeof data === 'string' ? data : data.toString()
      this.form.content = getImageUrlFromMd(md)
    },
    async save () {
      if (!this.fireUser) throw Error('로그인이 필요합니다')
      if (!this.form.category) throw Error('종류는 필수 항목입니다')
      if (!this.form.title) throw Error('제목은 필수 항목입니다')
      if (!this.form.content) throw Error('내용은 필수 항목입니다')
      this.loading = true
      if (this.form.images.length && (this.form.content !== this.form.images[0].url)) { this.form.images = [] }
      const md = setMdFromImageUrl(this.form.content)
      try {
        const doc = {
          title: this.form.title,
          category: this.form.category,
          tags: this.form.tags,
          images: this.form.images, // this.form.images,
          updatedAt: new Date(),
          summary: md,
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
          await this.ref.set(doc)
          this.exists = true
          this.$router.push('/board/' + this.boardId)
        } else {
          const fn = this.articleId + '-' + this.article.uid + '.md'
          await this.$firebase.storage().ref().child('boards').child(this.boardId).child(fn).putString(md)
          await this.ref.update(doc)
          this.$router.push('/board/' + this.boardId + '/' + this.articleId)
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

      this.form.images[0] = image
      this.form.content = image.url
      return image
    }
  }
}
</script>
