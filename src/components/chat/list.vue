<template>
  <v-list v-if="!loaded">
    <v-skeleton-loader type="article" v-for="i in 5" :key="i"/>
  </v-list>
  <v-list v-else>
    <template v-for="(item) in items">
      <chat-item :item="item" :key="item.id"/>
      <!-- <v-list-item :key="item.id">
        <v-list-item-action>
          <display-user :user="item" :uid="item.id"/>
        </v-list-item-action>
      </v-list-item> -->
      <!-- <v-divider :key="i" v-if="i < items.length - 1"/> -->
    </template>
    <v-list-item v-if="lastDoc">
      <v-btn
        @click="more"
        text
        color="primary"
        block
        :loading="loading">
        <v-icon>mdi-dots-horizontal</v-icon>더보기
      </v-btn>
    </v-list-item>
  </v-list>
</template>
<script>
import { last } from 'lodash'
import ChatItem from './item'
// import DisplayUser from '@/components/display-user'
export default {
  // components: { DisplayUser },
  components: { ChatItem },
  data () {
    return {
      items: [],
      unsubscribe: null,
      loaded: false,
      ref: this.$firebase.firestore().collection('users'),
      lastDoc: null,
      loading: false
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  watch: {
    user (n) {
      if (n) this.subscribe()
      else this.destroy()
    }
  },
  created () {
    if (this.user) this.subscribe()
  },
  destroyed () {
    this.destroy()
  },
  methods: {
    destroy () {
      this.items = []
      if (this.unsubscribe) this.unsubscribe()
    },
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
          findItem.online = item.online
        }
      })
    },
    subscribe () {
      this.destroy()
      const query = this.ref
      // .where('online', '==', true)
        .where('email', '!=', this.user.email)
      this.unsubscribe = query.limit(4).onSnapshot(sn => {
        this.loaded = true
        this.snapshotToItems(sn)
      }, (e) => console.error('users get err: ' + e.message))
    },
    async more () {
      if (!this.lastDoc) throw Error('더이상 데이터가 없습니다')
      if (this.loading) return
      this.loading = true
      try {
        const sn = await this.ref.where('email', '!=', this.user.email).startAfter(this.lastDoc).limit(4).get()
        this.snapshotToItems(sn)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
