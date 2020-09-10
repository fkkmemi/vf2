<template>
  <v-container v-if="!loaded" fluid>
    <v-skeleton-loader type="article" v-for="i in 4" :key="i"></v-skeleton-loader>
  </v-container>
  <v-container v-else-if="loaded && !items.length" fluid>
    <v-alert type="warning" border="left" class="mb-0">
      데이터가 없습니다
    </v-alert>
  </v-container>
  <v-container v-else fluid :class="xs ? 'pa-0' : ''">
    <!-- <v-divider v-if="xs"/> -->
    <v-card :outlined="!isWidget && !xs" :tile="xs" :flat="xs">
      <v-toolbar color="transparent" dense flat>
        <span>
          전체댓글
        </span>
        <v-spacer/>
        <v-btn @click="show=!show" icon v-if="uid">
          <v-icon v-text="show ? 'mdi-chevron-up' : 'mdi-chevron-down'"></v-icon>
        </v-btn>
      </v-toolbar>
      <template v-if="show">
        <v-divider/>
        <v-expand-transition>
          <v-sheet :color="$vuetify.theme.dark && !xs ? 'black' : 'transparent'">
            <items :items="items" :loading="loading" :lastDoc="lastDoc" @more="fetch" :uid="uid"/>
          </v-sheet>
        </v-expand-transition>
      </template>
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
      ref: this.$firebase.firestore().collection('comments'),
      lastDoc: null,
      show: true,
      unsubscribe: null
    }
  },
  computed: {
    xs () {
      return this.$vuetify.breakpoint.xs
    },
    limit () {
      const { xs, sm, md, lg, xl } = this.$vuetify.breakpoint
      if (xs || sm) return 2
      if (md) return 3
      if (lg || xl) return 4
      return 4
    },
    query () {
      let query = this.ref
      if (this.uid) query = query.where('uid', '==', this.uid)
      query = query.orderBy('createdAt', 'desc')
      if (this.lastDoc) query = query.startAfter(this.lastDoc)
      return query
    }
  },
  watch: {
    uid () {
      this.subscribe()
    }
  },
  mounted () {
    this.subscribe()
  },
  methods: {
    destroy () {
      if (this.unsubscribe) this.unsubscribe()
    },
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
    subscribe () {
      this.lastDoc = null
      this.items = []
      this.destroy()
      this.unsubscribe = this.query.limit(this.limit).onSnapshot(sn => {
        this.loaded = true
        this.snapshotToItems(sn)
      })
    },
    async fetch () {
      if (this.loading) return
      try {
        this.loading = true
        const sn = await this.query.limit(this.limit).get()
        this.snapshotToItems(sn)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
