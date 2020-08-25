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
      <v-col cols="12" sm="4" :order="$vuetify.breakpoint.xs ? 1 : null">
        <card-count :total="total" :values="sitemapValue.counts" :items="sitemaps"/>
      </v-col>
      <v-col cols="12" sm="4" :order="$vuetify.breakpoint.xs ? 2 : null">
        <card-read-count :total="total" :values="sitemapValue.readCounts" :items="sitemaps"/>
      </v-col>
      <v-col cols="12" sm="4" :order="$vuetify.breakpoint.xs ? 3 : null">
        <card-total :item="total"/>
      </v-col>
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
  computed: {
    total () {
      const values = {
        count: 0,
        readCount: 0,
        commentCount: 0,
        likeCount: 0
      }
      this.items.forEach(item => {
        values.count += item.count
        values.readCount += item.readCount
        values.commentCount += item.commentCount
        values.likeCount += item.likeCount
      })
      return values
    },
    sitemapValue () {
      const values = {
        counts: [],
        readCounts: []
      }
      if (!this.sitemaps.length) return values
      this.sitemaps.forEach(item => {
        let countSum = 0
        let readCountSum = 0
        for (const [key, value] of Object.entries(item)) {
          if (key === 'createdAt') continue
          countSum += value.count
          readCountSum += value.readCount
          // console.log(`${key}: ${value.count}`)
        }
        values.counts.push(countSum)
        values.readCounts.push(readCountSum)
      })
      if (this.total.count) values.counts.push(this.total.count)
      if (this.total.readCount) values.readCounts.push(this.total.readCount)
      return values
    }
  },
  methods: {
    setBoards () {
      const filteredItem = this.items.filter(item => item.main && item.type === '일반')
      if (filteredItem.length > 0) {
        this.first = filteredItem[0]
        if (filteredItem.length > 1) this.second = filteredItem[1]
      }
      this.third = this.items.find(item => item.type === '갤러리')
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
          findItem.readCount = item.readCount
          findItem.commentCount = item.commentCount
          findItem.likeCount = item.likeCount
          findItem.description = item.description
          findItem.categories = item.categories
          findItem.tags = item.tags
          findItem.type = item.type
          findItem.updatedAt = item.updatedAt.toDate()
        }
      })
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
        .orderBy('createdAt').limitToLast(4).get()
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
