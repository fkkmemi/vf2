<template>
  <v-container fluid v-if="!loaded">
    <v-skeleton-loader type="article"></v-skeleton-loader>
  </v-container>
  <v-container fluid v-else-if="loaded && !items.length">
    <v-alert v-if="!empty" type="warning" border="left" class="mb-0">
      표시할 내용이 없습니다
    </v-alert>
  </v-container>
  <v-container fluid v-else>
    <v-row>
      <v-col cols="12" sm="4">
        <card-count :items="sitemaps"/>
      </v-col>
      <v-col cols="12" sm="4">
        <card-read-count :items="sitemaps"/>
      </v-col>
      <v-col cols="12" sm="4">
        <card-total :items="sitemaps"/>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="6" v-if="first">
        <board-content :boardId="first.id" :isWidget="true" />
      </v-col>
      <v-col cols="12" sm="6" v-if="second">
        <board-content :boardId="second.id" :isWidget="true" />
      </v-col>
      <v-col cols="12" v-if="third">
        <board-content :boardId="third.id" :isWidget="true" />
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import setMeta from '@/util/setMeta'
import BoardContent from '@/components/board/content'
import CardCount from './card-count'
import CardReadCount from './card-read-count'
import CardTotal from './card-total'
const LIMIT = 10

export default {
  components: { BoardContent, CardCount, CardReadCount, CardTotal },
  data () {
    return {
      empty: false,
      loaded: false,
      unsubscribe: null,
      ref: null,
      items: [],
      first: null,
      second: null,
      third: null,
      count: {
        article: 0,
        read: 0,
        comment: 0,
        like: 0
      },
      sitemaps: []
    }
  },
  created () {
    setMeta({ title: '메인페이지', description: '메인페이지', image: '/logo.png' })
    this.getSitemapLogs()
    this.subscribe()
  },
  destroyed () {
    if (this.unsubscribe) this.unsubscribe()
  },
  methods: {
    setBoards () {
      const filteredItem = this.items.filter(item => item.type === '일반')
      if (filteredItem.length > 0) {
        this.first = filteredItem[0]
        if (filteredItem.length > 1) this.second = filteredItem[1]
      }
      this.third = this.items.find(item => item.type === '갤러리')
    },
    setCounts () {
      this.items.forEach(item => {
        this.count.article += item.count
        this.count.read += item.readCount
        this.count.comment += item.commentCount
        this.count.like += item.likeCount
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
          this.items.push(item)
        } else {
          findItem.category = item.category
          findItem.title = item.title
          findItem.count = item.count
          findItem.description = item.description
          findItem.categories = item.categories
          findItem.tags = item.tags
          findItem.type = item.type
          findItem.updatedAt = item.updatedAt.toDate()
        }
      })
      this.setCounts()
      this.setBoards()
    },
    async subscribe () {
      if (this.unsubscribe) this.unsubscribe()
      this.ref = this.$firebase.firestore()
        .collection('boards').limit(LIMIT)
      this.loaded = false
      this.unsubscribe = this.ref.onSnapshot(sn => {
        this.loaded = true
        if (sn.empty) {
          this.items = []
          return
        }
        this.snapshotToItems(sn)
      }, console.error)
    },
    async getSitemapLogs () {
      const sn = await this.$firebase.firestore()
        .collection('sitemapLogs')
        .orderBy('createdAt').limitToLast(5).get()
      if (sn.empty) return
      const items = sn.docs.map(doc => {
        const item = doc.data()
        item.createdAt = item.createdAt.toDate()
        return item
      })
      this.sitemaps = items
    }
  }
}
</script>
