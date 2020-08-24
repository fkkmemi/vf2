<template>
  <v-container fluid v-if="!loaded">
    <v-skeleton-loader type="article" v-for="i in 3" :key="i"></v-skeleton-loader>
  </v-container>
  <v-container fluid v-else-if="loaded && !items.length">
    <v-alert type="warning" border="left" class="mb-0">
      사용자가 없습니다
    </v-alert>
  </v-container>
  <v-container v-else fluid :class="$vuetify.breakpoint.xs ? 'pa-0' : ''">
    <v-card outlined :tile="$vuetify.breakpoint.xs">
      <v-toolbar color="transparent" dense flat>
        <v-toolbar-title>
          사용자 관리
        </v-toolbar-title>
      </v-toolbar>
      <v-divider/>
      <template v-for="item in items">
        <item-user :key="item.uid" :item="item" />
      </template>
      <v-list-item v-if="lastDoc">
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
    </v-card>
  </v-container>
</template>
<script>
import { last } from 'lodash'
import ItemUser from './item'
import newCheck from '@/util/newCheck'
const LIMIT = 5

export default {
  components: { ItemUser },
  data () {
    return {
      items: [],
      lastDoc: null,
      loading: false,
      newCheck,
      ref: null,
      loaded: false
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  created () {
    this.init()
  },
  destroyed () {
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
          item.visitedAt = item.visitedAt.toDate()
          this.items.push(item)
        } else {
          findItem.email = item.email
          findItem.displayName = item.displayName
          findItem.photoURL = item.photoURL
          findItem.updatedAt = item.updatedAt.toDate()
          findItem.level = item.level
          findItem.visitedAt = item.visitedAt.toDate()
          findItem.visitCount = item.visitCount
        }
      })
      this.items.sort((before, after) => after.createdAt.getTime() - before.createdAt.getTime())
    },
    async init () {
      this.ref = this.$firebase.firestore()
        .collection('users').orderBy('createdAt', 'desc').limit(LIMIT)
      try {
        const sn = await this.ref.get()
        this.snapshotToItems(sn)
        this.loaded = true
      } finally {
        this.loading = false
      }
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
