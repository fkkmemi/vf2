<template>
  <v-container fluid v-if="!loaded">
    <v-skeleton-loader type="article" v-for="i in 3" :key="i"></v-skeleton-loader>
  </v-container>
  <v-container fluid v-else-if="loaded && !items.length">
    <v-alert type="warning" border="left" class="mb-0">
      게시물이 없습니다 <v-icon>mdi-plus</v-icon> 버튼을 눌러서 게시물을 작성하세요~
    </v-alert>
  </v-container>
  <v-container fluid v-else :class="$vuetify.breakpoint.xs || $store.state.boardTypeList ? 'pa-0' : ''">
    <template v-if="board.type === '일반'">
      <list-compact v-if="$store.state.boardTypeList || isWidget" :items="items" :boardId="boardId" :category="category" :isWidget="isWidget"/>
      <list-normal v-else :items="items" :boardId="boardId" :category="category"/>
    </template>
    <list-gallery v-else :items="items" :boardId="boardId" :category="category" :isWidget="isWidget"/>
    <v-list-item v-if="isMoreEnable && !isWidget">
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

const itemsSort = (before, after) => {
  if (after.important > before.important) return 1
  else if (after.important < before.important) return -1
  return Number(after.id) - Number(before.id)
}

export default {
  components: { ListCompact, ListNormal, ListGallery },
  props: ['board', 'boardId', 'category', 'tag', 'isWidget'],
  data () {
    return {
      items: [],
      unsubscribe: null,
      ref: null,
      lastDoc: null,
      order: 'createdAt',
      sort: 'desc',
      loading: false,
      loaded: false,
      query: null
    }
  },
  computed: {
    fireUser () {
      return this.$store.state.fireUser
    },
    getCategory () {
      if (!this.category) return '전체'
      return this.category
    },
    typeLimit () {
      if (!this.board) return 4
      return this.board.type === '일반' ? 4 : 4
    },
    isMoreEnable () {
      if (!this.board) return false
      if (this.category) {
        if (this.board.categoryCount[this.category] > this.items.length) return true
      } else {
        if (this.board.count > this.items.length) return true
      }
      return false
    }
  },
  created () {
    this.subscribe()
  },
  destroyed () {
    if (this.unsubscribe) this.unsubscribe()
    this.setCachedItems()
  },
  methods: {
    cachedData () {
      const cached = this.$store.state.cached[this.boardId]
      const val = {
        lastDoc: null,
        items: []
      }
      if (!cached) return val
      if (!cached.lastDoc || !cached.items.length) return val
      val.lastDoc = cached.lastDoc
      if (!this.isWidget) {
        val.items = this.category
          ? cached.items.filter(item => item.category === this.category)
          : cached.items
      } else {
        val.items = cached.items.filter((item, i) => i < this.typeLimit && !item.important)
      }
      return val
    },
    setCachedItems () {
      const cached = this.$store.state.cached[this.boardId]
      if (!cached || (cached && !cached.items)) {
        this.$store.commit('setCached', {
          boardId: this.boardId,
          lastDoc: this.lastDoc,
          items: this.items
        })
        return
      }
      const newItems = this.items.filter(item => {
        return !cached.items.some(cachedItem => item.id === cachedItem.id)
      })
      cached.items = newItems.concat(cached.items)
      cached.items.sort(itemsSort)
      this.$store.commit('setCached', {
        boardId: this.boardId,
        lastDoc: this.lastDoc,
        items: cached.items
      })
    },
    snapshotToItems (sn) {
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
          findItem.category = item.category
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
      this.items.sort(itemsSort)
    },
    subscribe () {
      const v = this.cachedData()
      this.lastDoc = v.lastDoc
      this.items = v.items
      if (this.unsubscribe) this.unsubscribe()
      this.ref = this.$firebase.firestore()
        .collection('boards').doc(this.boardId)
        .collection('articles')

      if (!this.category) {
        if (!this.isWidget) {
          this.ref
            .where('important', '>', 0)
            .orderBy('important', 'desc').get()
            .then(sn => this.snapshotToItems(sn))
            .catch(console.error)
        }
        this.query = this.ref
          .where('important', '==', 0)
          .orderBy(this.order, this.sort)
      } else {
        if (!this.isWidget) {
          this.ref
            .where('category', '==', this.category)
            .where('important', '>', 0)
            .orderBy('important', 'desc').get()
            .then(sn => this.snapshotToItems(sn))
            .catch(console.error)
        }
        this.query = this.ref
          .where('category', '==', this.category)
          .where('important', '==', 0)
          .orderBy(this.order, this.sort)
      }
      this.loaded = !!this.items.length
      this.unsubscribe = this.query.limit(this.typeLimit).onSnapshot(sn => {
        this.loaded = true
        if (sn.empty) return
        if (!this.lastDoc) this.lastDoc = last(sn.docs)
        this.snapshotToItems(sn)
      }, console.error)
      if (this.isWidget) return
      setMeta({
        title: this.board.title + ' ' + this.getCategory + ' 목록',
        description: this.board.description.substr(0, 80),
        image: '/logo.png'
      })
    },
    async more () {
      if (!this.loaded) return
      if (!this.lastDoc) throw Error('더이상 데이터가 없습니다')
      // if (this.loading) return
      this.loading = true
      try {
        const sn = await this.query.startAfter(this.lastDoc).limit(this.typeLimit).get()
        this.lastDoc = last(sn.docs)
        if (!sn.empty) this.snapshotToItems(sn)
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
