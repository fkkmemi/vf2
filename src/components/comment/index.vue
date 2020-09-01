<template>
  <v-container v-if="!loaded" fluid>
    <v-skeleton-loader type="article" v-for="i in 4" :key="i"></v-skeleton-loader>
  </v-container>
  <v-container v-else-if="loaded && !items.length" fluid>
    <v-alert type="warning" border="left" class="mb-0">
      데이터가 없습니다
    </v-alert>
  </v-container>
  <v-container v-else fluid :class="$vuetify.breakpoint.xs ? 'pa-0' : ''">
    <v-card :outlined="!isWidget" :tile="$vuetify.breakpoint.xs">
      <v-toolbar color="transparent" dense flat>
        전체댓글
      </v-toolbar>
      <v-divider/>
      <items :items="items" :loading="loading" :lastDoc="lastDoc" @more="fetch"/>
    </v-card>
  </v-container>
</template>
<script>
import { last } from 'lodash'
import Items from './items'
export default {
  components: { Items },
  props: ['boardId', 'articleId', 'category', 'uid', 'isWidget'],
  data () {
    return {
      loaded: false,
      loading: false,
      items: [],
      ref: null,
      lastDoc: null
    }
  },
  computed: {
    limit () {
      const { xs, sm, md, lg, xl } = this.$vuetify.breakpoint
      if (xs || sm) return 2
      if (md) return 3
      if (lg || xl) return 4
      return 4
    }
  },
  mounted () {
    this.fetch()
  },
  methods: {
    snapshotToItems (sn) {
      if (sn.empty) {
        this.lastDoc = null
        return
      }
      this.lastDoc = last(sn.docs)
      sn.docs.forEach(doc => {
        const findItem = this.items.find(item => doc.id === item.id)
        const item = doc.data()
        if (!findItem) {
          item.id = doc.id
          item.createdAt = item.createdAt.toDate()
          item.updatedAt = item.updatedAt.toDate()
          this.items.push(item)
        } else {
          findItem.comment = item.comment
          findItem.likeCount = item.likeCount
          findItem.likeUids = item.likeUids
          findItem.updatedAt = item.updatedAt.toDate()
          findItem.no = item.no
        }
      })
    },
    async fetch () {
      this.ref = this.$firebase.firestore().collection('comments')
      if (this.loading) return
      try {
        this.loading = true
        let query = this.ref.orderBy('createdAt', 'desc')
        if (this.lastDoc) query = query.startAfter(this.lastDoc)
        const sn = await query.limit(this.limit).get()
        this.snapshotToItems(sn)
      } finally {
        this.loaded = true
        this.loading = false
      }
    }
  }
}
</script>
