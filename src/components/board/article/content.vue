<template>
  <v-container fluid v-if="!loaded">
    <v-skeleton-loader type="article"></v-skeleton-loader>
  </v-container>
  <v-container fluid v-else-if="loaded && !article">
    <v-alert type="warning" border="left" class="mb-0">
      게시물이 없습니다
    </v-alert>
  </v-container>
  <v-container v-else fluid :class="$vuetify.breakpoint.xs ? 'pa-0' : ''">
    <v-card outlined :tile="$vuetify.breakpoint.xs">
      <v-toolbar color="transparent" dense flat>
        <v-toolbar-title>
          <v-btn
            color="primary"
            depressed
            small
            class="mr-4"
            outlined
            @click="goCategory"
          >
            {{article.category}}
            <v-icon v-if="!category" right>mdi-menu-right</v-icon>
          </v-btn>
        </v-toolbar-title>
        <v-spacer/>
        <template v-if="(fireUser && fireUser.uid === article.uid) || (user && user.level === 0)">
          <v-spacer/>
          <v-btn @click="articleWrite" icon color="primary"><v-icon>mdi-pencil</v-icon></v-btn>
          <v-btn @click="remove" icon color="error"><v-icon>mdi-delete</v-icon></v-btn>
        </template>
        <v-btn @click="back" icon><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>
      <v-divider/>
      <v-card-subtitle class="text--primary body-1">
        <display-title :item="article"/>
      </v-card-subtitle>
      <v-card-text>
        <viewer v-if="content" :initialValue="content" @load="onViewerLoad" :options="tuiOptions"></viewer>
        <v-container v-else>
          <v-row justify="center" align="center">
            <v-progress-circular indeterminate></v-progress-circular>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <span class="font-italic caption">
          작성일: <display-time :time="article.createdAt"></display-time>
        </span>
      </v-card-actions>
      <v-card-actions>
        <v-spacer/>
        <span class="font-italic caption">
          수정일: <display-time :time="article.updatedAt"></display-time>
        </span>
      </v-card-actions>
      <v-card-actions>
        <v-spacer/>
        <span class="font-italic caption mr-4">
          작성자:
        </span>
        <display-user :user="article.user"></display-user>
      </v-card-actions>
      <v-card-actions>
        <v-spacer/>
        <display-count :item="article" :column="false"></display-count>
      </v-card-actions>
      <v-card-actions>
        <v-spacer/>
        <v-btn rounded @click="like" :color="liked ? 'success' : ''">
          <v-icon left>mdi-thumb-up-outline</v-icon>
          좋아요
        </v-btn>
      </v-card-actions>
      <v-card-text>
        <v-row justify="start" align="center" class="px-4">
          <v-btn
            color="primary"
            depressed
            small
            outlined
            class="mr-4 mb-2"
            @click="goCategory"
          >
            {{article.category}}
            <v-icon right>mdi-menu-right</v-icon>
          </v-btn>
          <v-chip small label outlined color="info" class="mr-2 mb-2" v-for="tag in article.tags" :key="tag" v-text="tag"></v-chip>
        </v-row>
      </v-card-text>
      <v-card-actions v-if="(fireUser && fireUser.uid === article.uid) || (user && user.level === 0)">
        <v-spacer/>
        <v-btn @click="articleWrite" text color="primary"><v-icon left>mdi-pencil</v-icon>수정</v-btn>
        <v-btn @click="remove" text color="error"><v-icon left>mdi-delete</v-icon>삭제</v-btn>
        <v-btn @click="back" text><v-icon left>mdi-close</v-icon>닫기</v-btn>
      </v-card-actions>
      <v-divider/>
      <v-card-actions class="py-0" v-intersect="onIntersect">
        <v-row no-gutters>
          <v-col cols="12" sm="1">
          </v-col>
          <v-col cols="12" sm="4">
            <v-list-item v-if="prev.to" :to="prev.to">
              <v-list-item-icon>
                <v-icon x-large>mdi-menu-left</v-icon>
              </v-list-item-icon>
              <v-list-item-content class="subtitle-2">
                {{prev.text}}
              </v-list-item-content>
            </v-list-item>
          </v-col>
          <v-col cols="12" sm="2" class="d-flex justify-center hidden-xs-only">
            <v-divider vertical></v-divider>
          </v-col>
          <v-col cols="12" sm="4">
            <v-list-item v-if="next.to" :to="next.to">
              <v-list-item-content class="subtitle-2">
                <span class="text-end">{{next.text}}</span>
              </v-list-item-content>
              <v-list-item-icon><v-icon x-large>mdi-menu-right</v-icon></v-list-item-icon>
            </v-list-item>
          </v-col>
          <v-col cols="12" sm="1">
          </v-col>
        </v-row>
      </v-card-actions>
      <v-divider/>
      <display-comment :boardId="boardId" :articleId="articleId" :article="article" :docRef="ref"></display-comment>
    </v-card>
  </v-container>
</template>
<script>
import 'highlight.js/styles/github.css'
import axios from 'axios'
import DisplayTime from '@/components/display-time'
import DisplayComment from '@/components/display-comment'
import DisplayUser from '@/components/display-user'
import DisplayTitle from '@/components/display-title'
import DisplayCount from '@/components/display-count'
import addYoutubeIframe from '@/util/addYoutubeIframe'
import setMeta from '@/util/setMeta'
import getImageUrlFromMd from '@/util/getImageUrlFromMd'
import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight'
import hljs from 'highlight.js/lib/highlight'
import javascript from 'highlight.js/lib/languages/javascript'
import bash from 'highlight.js/lib/languages/bash'
import dart from 'highlight.js/lib/languages/dart'
import vue from 'vue-highlight.js/lib/languages/vue'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('dart', dart)
hljs.registerLanguage('vue', vue)

export default {
  components: { DisplayTime, DisplayComment, DisplayUser, DisplayTitle, DisplayCount },
  props: ['boardId', 'articleId', 'action', 'category', 'tag'],
  data () {
    return {
      tuiOptions: {
        linkAttribute: {
          target: '_blank'
        },
        plugins: [[codeSyntaxHighlight, { hljs }]]
      },
      content: '',
      ref: null,
      unsubscribe: null,
      article: null,
      doc: null,
      loaded: false,
      pageNavLoaded: false,
      prev: {
        text: '',
        to: ''
      },
      next: {
        text: '',
        to: ''
      },
      loading: false
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    fireUser () {
      return this.$store.state.fireUser
    },
    liked () {
      if (!this.fireUser) return false
      return this.article.likeUids.includes(this.fireUser.uid)
    }
  },
  watch: {
    boardId () {
      this.subscribe()
    },
    articleId () {
      this.subscribe()
    },
    action () {
      this.subscribe()
    }
  },
  async created () {
    this.subscribe()
  },
  destroyed () {
    if (this.unsubscribe) this.unsubscribe()
  },
  methods: {
    subscribe () {
      this.pageNavLoaded = false
      window.scrollTo(0, 0)
      if (this.unsubscribe) this.unsubscribe()
      this.ref = this.$firebase.firestore().collection('boards').doc(this.boardId).collection('articles').doc(this.articleId)
      this.ref.update({
        readCount: this.$firebase.firestore.FieldValue.increment(1)
      })
      this.loaded = false
      this.unsubscribe = this.ref.onSnapshot(doc => {
        this.loaded = true
        if (!doc.exists) {
          this.removeCache()
          return
        }
        this.doc = doc
        const item = doc.data()
        item.createdAt = item.createdAt.toDate()
        item.updatedAt = item.updatedAt.toDate()
        if (!this.article || this.article.url !== item.url) this.fetch(item)
        this.article = item

        let imgSrc = '/logo.png'
        if (this.article.images.length) imgSrc = this.article.images[0].thumbUrl
        else {
          const src = getImageUrlFromMd(this.content)
          if (src) imgSrc = src
        }
        setMeta({
          title: item.title,
          description: item.summary.substr(0, 80),
          image: imgSrc
        })
      }, console.error)
    },
    async fetch (item) {
      this.content = ''
      if (item.summary.length >= 300) {
        const r = await axios.get(item.url)
        this.content = typeof r.data === 'string' ? r.data : r.data.toString()
      } else {
        this.content = item.summary
      }
    },
    async articleWrite () {
      const to = {
        path: '/board/' + this.boardId + '/' + this.articleId,
        query: { action: 'write', category: this.article.category }
      }
      this.$router.push(to)
    },
    removeCache () {
      const cached = this.$store.state.cached[this.boardId]
      if (!cached) return
      if (!cached.items) return
      const i = cached.items.findIndex(item => item.id === this.articleId)
      if (i < 0) return
      cached.items.splice(i, 1)
      this.$store.commit('setCached', {
        boardId: this.boardId,
        lastDoc: this.lastDoc,
        items: this.items
      })
    },
    async remove () {
      const r = await this.$swal.fire({
        title: '정말 삭제하시겠습니까?',
        text: '삭제 후 되돌릴 수 없습니다.',
        icon: 'error',
        // confirmButtonText: 'Cool',
        showCancelButton: true
      })
      if (!r.value) return
      await this.ref.delete()
      this.removeCache()
      this.back()
    },
    back () {
      const to = {
        path: '/board/' + this.boardId,
        query: {}
      }
      if (this.category) to.query.category = this.category
      this.$router.push(to)
    },
    async like () {
      if (!this.fireUser) throw Error('로그인이 필요합니다')
      if (this.liked) {
        await this.ref.update({
          likeCount: this.$firebase.firestore.FieldValue.increment(-1),
          likeUids: this.$firebase.firestore.FieldValue.arrayRemove(this.fireUser.uid)
        })
      } else {
        await this.ref.update({
          likeCount: this.$firebase.firestore.FieldValue.increment(1),
          likeUids: this.$firebase.firestore.FieldValue.arrayUnion(this.fireUser.uid)
        })
      }
    },
    goCategory () {
      const to = {
        path: '/board/' + this.boardId,
        query: { category: this.article.category }
      }
      this.$router.push(to)
    },
    onViewerLoad (v) {
      addYoutubeIframe(v.preview.el, this.$vuetify.breakpoint)
    },
    onIntersect (entries, observer, isIntersecting) {
      if (this.pageNavLoaded) return
      if (!this.content) return
      if (!isIntersecting) return
      this.pageNavLoaded = true
      this.createPages()
    },
    async createPages () {
      let ref
      if (!this.category) {
        ref = this.$firebase.firestore()
          .collection('boards').doc(this.boardId)
          .collection('articles')
          .orderBy('createdAt', 'desc')
      } else {
        ref = this.$firebase.firestore()
          .collection('boards').doc(this.boardId)
          .collection('articles')
          .where('category', '==', this.category)
          .orderBy('createdAt', 'desc')
      }
      try {
        this.loading = true
        const prevSn = await ref.endBefore(this.doc).limitToLast(1).get()
        if (prevSn.empty) {
          this.prev = { to: '', text: '' }
        } else {
          const prevDoc = prevSn.docs[0]
          const prevTo = { path: '/board/' + this.boardId + '/' + prevDoc.id }
          if (this.category) prevTo.query = { category: this.category }
          this.prev.to = prevTo
          this.prev.text = prevDoc.data().title
        }

        const nextSn = await ref.startAfter(this.doc).limit(1).get()
        if (nextSn.empty) {
          this.next = { to: '', text: '' }
        } else {
          const nextDoc = nextSn.docs[0]
          const nextTo = { path: '/board/' + this.boardId + '/' + nextDoc.id }
          if (this.category) nextTo.query = { category: this.category }
          this.next.to = nextTo
          this.next.text = nextDoc.data().title
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
<style scoped>

</style>
