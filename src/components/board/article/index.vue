<template>
  <v-container fluid v-if="!loaded">
    <v-skeleton-loader type="article" v-for="i in 3" :key="i"></v-skeleton-loader>
  </v-container>
  <v-container fluid v-else-if="loaded && !items.length">
    <v-alert type="warning" border="left" class="mb-0">
      게시물이 없습니다 <v-icon>mdi-plus</v-icon> 버튼을 눌러서 게시물을 작성하세요~
    </v-alert>
  </v-container>
  <v-container fluid v-else class="pa-0">
    <template v-if="board.type === '일반'">
      <list-compact v-if="$store.state.boardTypeList" :items="items" :boardId="boardId" :category="category"/>
      <list-normal v-else :items="items" :boardId="boardId" :category="category"/>
    </template>
    <list-gallery v-else :items="items" :boardId="boardId" :category="category"/>
    <v-list-item v-if="lastDoc && items.length < board.count">
      <v-btn
        @click="more"
        v-intersect="onIntersect"
        text
        color="primary"
        block
        :loading="loading">
        <v-icon>mdi-dots-horizontal</v-icon>더보기
      </v-btn>
    </v-list-item>
  </v-container>
</template>
<script>
import { last } from 'lodash'
import ListCompact from './components/list-compact'
import ListNormal from './components/list-normal'
import ListGallery from './components/list-gallery'
import setMeta from '@/util/setMeta'

const LIMIT = 5

export default {
  components: { ListCompact, ListNormal, ListGallery },
  props: ['board', 'boardId', 'category', 'tag'],
  data () {
    return {
      items: [],
      unsubscribe: null,
      ref: null,
      lastDoc: null,
      order: 'createdAt',
      sort: 'desc',
      loading: false,
      loaded: false
    }
  },
  computed: {
    fireUser () {
      return this.$store.state.fireUser
    },
    getCategory () {
      if (!this.category) return '전체'
      return this.category
    }
  },
  watch: {
    boardId () {
      this.subscribe()
    },
    category () {
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
    snapshotToItems (sn) {
      this.lastDoc = last(sn.docs)
      sn.docs.forEach(doc => {
        const findItem = this.items.find(item => doc.id === item.id)
        const item = doc.data()
        if (!findItem) {
          item.id = doc.id
          item.createdAt = item.createdAt.toDate()
          item.updatedAt = item.updatedAt.toDate()
          item.overlay = false
          this.items.push(item)
        } else {
          if (findItem.summary !== item.summary) {
            findItem.summary = ''
            setTimeout(() => {
              findItem.summary = item.summary
            }, 1000)
          }
          findItem.title = item.title
          findItem.readCount = item.readCount
          findItem.commentCount = item.commentCount
          findItem.likeCount = item.likeCount
          findItem.likeUids = item.likeUids
          findItem.categories = item.categories
          findItem.tags = item.tags
          findItem.updatedAt = item.updatedAt.toDate()
          findItem.important = item.important
        }
      })
      this.items.sort((before, after) => {
        if (after.important > before.important) return 1
        else if (after.important < before.important) return -1
        return Number(after.id) - Number(before.id)
      })
    },
    subscribe (arrow) {
      if (this.unsubscribe) this.unsubscribe()
      this.items = []
      if (!this.category) {
        this.ref = this.$firebase.firestore()
          .collection('boards').doc(this.boardId)
          .collection('articles')
          .orderBy('important', 'desc')
          .orderBy(this.order, this.sort)
          .limit(LIMIT)
      } else {
        this.ref = this.$firebase.firestore()
          .collection('boards').doc(this.boardId)
          .collection('articles')
          .where('category', '==', this.category)
          .orderBy('important', 'desc')
          .orderBy(this.order, this.sort)
          .limit(LIMIT)
      }
      this.loaded = false
      this.unsubscribe = this.ref.onSnapshot(sn => {
        this.loaded = true
        if (sn.empty) {
          this.items = []
          return
        }
        this.snapshotToItems(sn)
        setMeta({
          title: this.board.title + ' ' + this.getCategory + ' 목록',
          description: this.board.description.substr(0, 80),
          image: '/logo.png'
        })
      })
    },
    async more () {
      if (!this.lastDoc) throw Error('더이상 데이터가 없습니다')
      if (this.loading) return
      this.loading = true
      try {
        const sn = await this.ref.startAfter(this.lastDoc).get()
        this.snapshotToItems(sn)
      } finally {
        this.loading = false
      }
    },
    onIntersect (entries, observer, isIntersecting) {
      if (isIntersecting) this.more()
    }
  }
}
</script>
