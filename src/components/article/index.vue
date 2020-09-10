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
    <v-card :outlined="!widget && !xs" :tile="xs" :flat="(xs && !widget) || !widget">
      <v-toolbar color="transparent" dense flat>
        <span v-if="sort === 'read'">
          조회수 순위
        </span>
        <span v-else-if="sort === 'comment'">
          댓글수 순위
        </span>
        <span v-else-if="sort === 'like'">
          좋아요수 순위
        </span>
        <span v-else>
          전체게시물
        </span>
        <v-spacer/>
        <template v-if="!widget">
          <v-chip-group active-class="primary--text">
            <v-chip
              exact
              small
              outlined
              v-for="s in sortItems"
              :key="s.value"
              :to="s.to">
              <v-icon small v-text="s.icon"></v-icon>
            </v-chip>
          </v-chip-group>
          <!-- <v-btn-toggle
            color="red"
            rounded
            dense
          >
            <v-btn>
              <v-icon>mdi-format-align-left</v-icon>
            </v-btn>
            <v-btn>
              <v-icon>mdi-format-align-center</v-icon>
            </v-btn>
            <v-btn>
              <v-icon>mdi-format-align-right</v-icon>
            </v-btn>
            <v-btn>
              <v-icon>mdi-format-align-justify</v-icon>
            </v-btn>
          </v-btn-toggle> -->
          <v-btn icon @click="$store.commit('toggleBoardType')">
            <v-icon v-text="$store.state.boardTypeList ? 'mdi-format-list-bulleted' : 'mdi-text-box-outline'"></v-icon>
          </v-btn>
        </template>
        <v-btn icon :to="'/article'" v-else>
          <v-icon>mdi-arrow-right-circle-outline</v-icon>
        </v-btn>

        <v-btn @click="show=!show" icon v-if="uid">
          <v-icon v-text="show ? 'mdi-chevron-up' : 'mdi-chevron-down'"></v-icon>
        </v-btn>
      </v-toolbar>
      <template v-if="show">
        <v-divider/>
        <v-expand-transition>
          <v-sheet :color="$vuetify.theme.dark && !xs ? 'black' : 'transparent'">
            <compact-items
              v-if="$store.state.boardTypeList || widget"
              :items="items"
              :loading="loading"
              :lastDoc="lastDoc"
              @more="fetch"
              :uid="uid"
              :boardId="boardId"
              :widget="widget"/>
            <normal-items
              v-else
              :items="items"
              :loading="loading"
              :lastDoc="lastDoc"
              @more="fetch"
              :uid="uid"
              :boardId="boardId"
              :widget="widget"/>
          </v-sheet>
        </v-expand-transition>
      </template>
    </v-card>
  </v-container>
</template>
<script>
import { last } from 'lodash'
import NormalItems from './normal-items'
import CompactItems from './compact-items'
export default {
  components: { NormalItems, CompactItems },
  props: ['boardId', 'category', 'uid', 'widget', 'sort'],
  data () {
    return {
      loaded: false,
      loading: false,
      items: [],
      ref: this.$firebase.firestore().collection('articles'),
      lastDoc: null,
      show: true,
      unsubscribe: null,
      sortItems: [
        { value: '', icon: 'mdi-restore', to: '/article' },
        { value: 'read', icon: 'mdi-eye', to: '/article?sort=read' },
        { value: 'comment', icon: 'mdi-comment', to: '/article?sort=comment' },
        { value: 'like', icon: 'mdi-thumb-up', to: '/article?sort=like' }
      ]
    }
  },
  computed: {
    limit () {
      if (this.widget) return 4
      const { xs, sm, md, lg, xl } = this.$vuetify.breakpoint
      if (xs || sm) return 2
      if (md) return 3
      if (lg || xl) return 4
      return 4
    },
    xs () {
      return this.$vuetify.breakpoint.xs
    },
    query () {
      let query = this.ref
      if (this.boardId) {
        query = query.where('boardId', '==', this.boardId)
        query = query.orderBy('createdAt', 'desc')
      } else if (this.uid) {
        query = query.where('uid', '==', this.uid)
        query = query.orderBy('createdAt', 'desc')
      } else {
        if (this.sort === 'read') {
          query = query.where('readCount', '>', 0)
          query = query.orderBy('readCount', 'desc')
        } else if (this.sort === 'like') {
          query = query.where('likeCount', '>', 0)
          query = query.orderBy('likeCount', 'desc')
        } else if (this.sort === 'comment') {
          query = query.where('commentCount', '>', 0)
          query = query.orderBy('commentCount', 'desc')
        } else query = query.orderBy('createdAt', 'desc')
      }
      if (this.lastDoc) query = query.startAfter(this.lastDoc)
      return query
    }
  },
  watch: {
    boardId () {
      this.subscribe()
    },
    uid () {
      this.subscribe()
    },
    sort () {
      this.subscribe()
    }
  },
  mounted () {
    this.subscribe()
  },
  destroyed () {
    this.destroy()
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
        const key = `${this.boardId}-${doc.id}-read`
        const read = JSON.parse(localStorage.getItem(key))
        const findItem = this.items.find(item => doc.id === item.id)
        const item = doc.data()
        if (!findItem) {
          item.id = doc.id
          item.createdAt = item.createdAt.toDate()
          item.updatedAt = item.updatedAt.toDate()
          // item.summary = summaryWithoutImage(item.summary)

          item.overlay = false
          if (read) item.read = read
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
          if (read) findItem.read = read
        }
      })
    },
    subscribe () {
      this.destroy()
      this.lastDoc = null
      this.items = []
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
        // this.loaded = true
        this.loading = false
      }
    }
  }
}
</script>
