<template>
  <v-list v-if="!loaded">
    <v-skeleton-loader type="article" v-for="i in 5" :key="i"/>
  </v-list>
  <v-list v-else>
    <template v-for="(item) in items">
      <chat-item :item="selectUser(item)" :key="item.id" @select="selectItem"/>
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
      ref: this.$firebase.firestore().collection('chats'),
      lastDoc: null,
      loading: false
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    query () {
      let q = this.ref
        .where('uids', 'array-contains-any', [this.user.uid])
        .where('count', '>', 0)
        .orderBy('count', 'desc')
      if (this.lastDoc) q = q.startAfter(this.lastDoc)
      q = q.limit(4)
      return q
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
      this.lastDoc = sn.docs.length >= 4 ? last(sn.docs) : null
      sn.docs.forEach(doc => {
        const findItem = this.items.find(item => doc.id === item.id)
        const item = doc.data()
        if (!findItem) {
          item.id = doc.id
          item.createdAt = item.createdAt.toDate()
          item.users.forEach(user => {
            user.createdAt = user.createdAt.toDate()
            user.updatedAt = user.updatedAt.toDate()
            user.visitedAt = user.visitedAt.toDate()
          })
          if (item.count) this.items.push(item)
        } else {
          findItem.updatedAt = item.updatedAt.toDate()
          item.users.forEach(user => {
            user.updatedAt = user.updatedAt.toDate()
            user.visitedAt = user.visitedAt.toDate()
          })
        }
      })
    },
    subscribe () {
      this.destroy()
      this.unsubscribe = this.query.onSnapshot(sn => {
        this.loaded = true
        this.snapshotToItems(sn)
      }, (e) => console.error('users get err: ' + e.message))
    },
    async more () {
      if (!this.lastDoc) throw Error('더이상 데이터가 없습니다')
      if (this.loading) return
      this.loading = true
      try {
        const sn = await this.query.get()
        this.snapshotToItems(sn)
      } finally {
        this.loading = false
      }
    },
    selectItem (item) {
      this.$emit('select', item)
    },
    selectUser (item) {
      return item.users.find(u => u.uid !== this.user.uid)
    }
  }
}
</script>
