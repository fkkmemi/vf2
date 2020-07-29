<template>
  <v-container fluid v-if="items.length" >
    <template v-for="(item, i) in items">
      <v-card :key="item.id" :class="i < items.length - 1 ? 'mb-4' : ''" :to="`${boardId}/${item.id}`">
        <v-subheader>

          <v-chip color="info" label small class="mr-4">{{item.category}}</v-chip>
          <display-time :time="item.createdAt"></display-time>
          <v-spacer/>
          <v-btn icon v-if="fireUser && fireUser.uid === item.uid" :to="`${boardId}/${item.id}?action=write`"><v-icon>mdi-pencil</v-icon></v-btn>
        </v-subheader>
        <v-card-title>
          {{item.title}}
        </v-card-title>
        <v-card-text class="text-content">
          {{item.summary}}
        </v-card-text>
        <v-card-actions>
          <display-user :user="item.user"></display-user>
          <v-spacer/>
          <v-sheet class="mr-4">
            <v-icon left :color="item.readCount ? 'info' : ''">mdi-eye</v-icon>
            <span class="body-2">{{item.readCount}}</span>
          </v-sheet>
          <v-sheet class="mr-4">
            <v-icon left :color="item.commentCount ? 'info' : ''">mdi-comment</v-icon>
            <span class="body-2">{{item.commentCount}}</span>
          </v-sheet>
          <v-sheet class="mr-0">
            <v-icon left :color="item.likeCount ? 'success' : ''">mdi-thumb-up</v-icon>
            <span class="body-2">{{item.likeCount}}</span>
          </v-sheet>
        </v-card-actions>
      </v-card>
    </template>
    <v-list-item v-if="lastDoc && items.length < board.count">
      <v-btn @click="more" v-intersect="onIntersect" text color="primary" block>더보기</v-btn>
    </v-list-item>
  </v-container>
  <v-container fluid v-else>
    <v-alert type="warning" border="left" class="mb-0">
      게시물이 없습니다
    </v-alert>
  </v-container>
</template>
<script>
import { last } from 'lodash'
import DisplayTime from '@/components/display-time'
import DisplayUser from '@/components/display-user'
const LIMIT = 5

export default {
  components: { DisplayTime, DisplayUser },
  props: ['board', 'boardId'],
  data () {
    return {
      items: [],
      unsubscribe: null,
      ref: null,
      lastDoc: null,
      order: 'createdAt',
      sort: 'desc'
    }
  },
  computed: {
    fireUser () {
      return this.$store.state.fireUser
    }
  },
  watch: {
    boardId () {
      this.subscribe()
    }
  },
  created () {
    const obj = {}
    // obj.a = 3
    // obj.b = 3
    console.log(Object.keys(obj).length)
    this.subscribe()
  },
  destroyed () {
    if (this.unsubscribe) this.unsubscribe()
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
          this.items.push(item)
        } else {
          findItem.title = item.title
          findItem.summary = item.summary
          findItem.readCount = item.readCount
          findItem.commentCount = item.commentCount
          findItem.likeCount = item.likeCount
          findItem.likeUids = item.likeUids
          findItem.categories = item.categories
          findItem.tags = item.tags
          findItem.updatedAt = item.updatedAt.toDate()
        }
      })
      this.items.sort((before, after) => {
        return Number(after.id) - Number(before.id)
      })
    },
    subscribe (arrow) {
      if (this.unsubscribe) this.unsubscribe()
      this.ref = this.$firebase.firestore()
        .collection('boards').doc(this.boardId)
        .collection('articles').orderBy(this.order, this.sort).limit(LIMIT)

      this.unsubscribe = this.ref.onSnapshot(sn => {
        if (sn.empty) {
          this.items = []
          return
        }
        this.snapshotToItems(sn)
      })
    },
    read (item) {
      this.$router.push({ path: this.$route.path + '/' + item.id })
    },
    async more () {
      if (!this.lastDoc) throw Error('더이상 데이터가 없습니다')
      const sn = await this.ref.startAfter(this.lastDoc).get()
      this.snapshotToItems(sn)
    },
    onIntersect (entries, observer, isIntersecting) {
      if (isIntersecting) this.more()
    }
  }
}
</script>

<style scoped>
.text-content {
  white-space: pre-wrap;
}
</style>
