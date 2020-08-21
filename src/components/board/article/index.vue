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
    <v-list-item v-if="createdAt && firstDoc">
      <v-btn
        @click="moreBefore"
        v-intersect="onIntersectBefore"
        text
        color="primary"
        block
        :loading="loadingBefore">
        <v-icon>mdi-dots-horizontal</v-icon>더보기
      </v-btn>
    </v-list-item>
    <template v-if="board.type === '일반'">
      <list-compact v-if="$store.state.boardTypeList || isWidget" :items="items" :boardId="boardId" :category="category" :isWidget="isWidget"/>
      <list-normal v-else :items="items" :boardId="boardId" :category="category"/>
    </template>
    <list-gallery v-else :items="items" :boardId="boardId" :category="category" :isWidget="isWidget"/>
    <v-list-item v-if="lastDoc && !isWidget">
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
import { head, last } from 'lodash'
import ListCompact from './components/list-compact'
import ListNormal from './components/list-normal'
import ListGallery from './components/list-gallery'
import setMeta from '@/util/setMeta'

const LIMIT = 5

export default {
  components: { ListCompact, ListNormal, ListGallery },
  props: ['board', 'boardId', 'category', 'tag', 'createdAt', 'isWidget'],
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
      firstDoc: null,
      query: null,
      loadingBefore: false
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
      // if (sn.empty) {
      //   this.firstDoc = null
      //   this.lastDoc = null
      //   return
      // }
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
        if (!this.createdAt) {
          this.query = this.ref
            .where('important', '==', 0)
            .orderBy(this.order, this.sort)
        } else {
          this.query = this.ref
            .where('important', '==', 0)
            .where('createdAt', '<=', new Date(Number(this.createdAt)))
            .orderBy(this.order, this.sort)
        }
      } else {
        if (!this.isWidget) {
          this.ref
            .where('category', '==', this.category)
            .where('important', '>', 0)
            .orderBy('important', 'desc').get()
            .then(sn => this.snapshotToItems(sn))
            .catch(console.error)
        }
        if (!this.createdAt) {
          this.query = this.ref
            .where('category', '==', this.category)
            .where('important', '==', 0)
            .orderBy(this.order, this.sort)
        } else {
          this.query = this.ref
            .where('category', '==', this.category)
            .where('important', '==', 0)
            .where('createdAt', '<=', new Date(Number(this.createdAt)))
            .orderBy(this.order, this.sort)
        }
      }
      this.loaded = false
      this.unsubscribe = this.query.limit(LIMIT).onSnapshot(sn => {
        this.loaded = true
        if (sn.empty) return
        this.firstDoc = head(sn.docs)
        this.lastDoc = last(sn.docs)
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
        const sn = await this.query.startAfter(this.lastDoc).limit(LIMIT).get()
        this.lastDoc = last(sn.docs)
        if (sn.docs.length < LIMIT) this.lastDoc = null
        if (!sn.empty) this.snapshotToItems(sn)
      } finally {
        this.loading = false
      }
    },
    onIntersect (entries, observer, isIntersecting) {
      if (isIntersecting) this.more()
    },
    async moreBefore () {
      if (this.loadingBefore) return
      if (!this.firstDoc) throw Error('더이상 데이터가 없습니다')
      this.loadingBefore = true
      try {
        let query
        if (!this.category) {
          if (!this.createdAt) {
            query = this.ref
              .where('important', '==', 0)
              .orderBy(this.order, this.sort)
          } else {
            query = this.ref
              .where('important', '==', 0)
              .where('createdAt', '>', new Date(Number(this.createdAt)))
              .orderBy(this.order, this.sort)
          }
        } else {
          if (!this.createdAt) {
            query = this.ref
              .where('category', '==', this.category)
              .where('important', '==', 0)
              .orderBy(this.order, this.sort)
          } else {
            query = this.ref
              .where('category', '==', this.category)
              .where('important', '==', 0)
              .where('createdAt', '>', new Date(Number(this.createdAt)))
              .orderBy(this.order, this.sort)
          }
        }
        const sn = await query.endBefore(this.firstDoc).limitToLast(LIMIT).get()
        this.firstDoc = head(sn.docs)
        if (sn.docs.length < LIMIT) this.firstDoc = null
        if (!sn.empty) this.snapshotToItems(sn)
      } finally {
        this.loadingBefore = false
      }
    },
    onIntersectBefore (entries, observer, isIntersecting) {
      if (isIntersecting) this.moreBefore()
    }
  }
}
</script>
