<template>
  <v-card flat>
    <v-card-title>
      <v-textarea
        v-model="comment"
        outlined
        label="댓글 작성"
        placeholder="Ctrl + Enter로 작성 가능"
        append-icon="mdi-comment-plus"
        @click:append="save"
        @keypress.ctrl.enter="save"
        hide-details
        auto-grow
        rows="1"
        clearable />
    </v-card-title>
    <template v-for="(item, i) in items">
      <v-list-item :key="item.id">
        <template v-if="$vuetify.breakpoint.smAndUp">
          <v-list-item-action>
            <display-user :user="item.user"></display-user>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-subtitle class="black--text comment" v-text="item.comment"></v-list-item-subtitle>
            <v-list-item-subtitle>
              <span class="font-italic"><display-time :time="item.createdAt"></display-time></span>
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn @click="like(item)" text>
              <v-icon left :color="liked(item) ? 'success': ''">mdi-thumb-up</v-icon>
              <span>{{item.likeCount}}</span>
            </v-btn>
          </v-list-item-action>
          <v-list-item-action v-if="(fireUser && fireUser.uid === item.uid) || (user && user.level === 0)">
            <v-btn icon @click="remove(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </template>
        <template v-else>
          <v-list-item-content>
            <v-list-item-subtitle class="black--text comment" v-text="item.comment"></v-list-item-subtitle>
            <v-list-item-subtitle class="d-flex justify-space-between align-center">
              <span class="font-italic"><display-time :time="item.createdAt"></display-time></span>
              <display-user :user="item.user" size="small"/>
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn @click="like(item)" text>
              <v-icon left :color="liked(item) ? 'success': ''">mdi-thumb-up</v-icon>
              <span>{{item.likeCount}}</span>
            </v-btn>
            <v-btn icon @click="remove(item)" v-if="(fireUser && fireUser.uid === item.uid) || (user && user.level === 0)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </template>
      </v-list-item>
      <v-divider :key="i" v-if="i < items.length - 1"></v-divider>
    </template>
    <v-list-item v-if="lastDoc && items.length < article.commentCount">
      <v-btn @click="more" :loading="loading" v-intersect="onIntersect" text color="primary" block>더보기</v-btn>
    </v-list-item>
  </v-card>
</template>
<script>
import { last } from 'lodash'
import DisplayTime from '@/components/display-time'
import DisplayUser from '@/components/display-user'
const LIMIT = 5

export default {
  components: { DisplayTime, DisplayUser },
  props: ['article', 'docRef'],
  data () {
    return {
      comment: '',
      items: [],
      unsubscribe: null,
      lastDoc: null,
      loading: false
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    fireUser () {
      return this.$store.state.fireUser
    }
  },
  watch: {
    docRef () {
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
        }
      })
      this.items.sort((before, after) => {
        return Number(after.id) - Number(before.id)
      })
    },
    subscribe () {
      if (this.unsubscribe) this.unsubscribe()
      this.items = []
      this.unsubscribe = this.docRef.collection('comments').orderBy('createdAt', 'desc').limit(LIMIT).onSnapshot(sn => {
        if (sn.empty) {
          this.items = []
          return
        }
        this.snapshotToItems(sn)
      })
    },
    async more () {
      if (!this.lastDoc) throw Error('더이상 데이터가 없습니다')
      if (this.loading) return
      this.loading = true
      try {
        const sn = await this.docRef.collection('comments').orderBy('createdAt', 'desc').startAfter(this.lastDoc).limit(LIMIT).get()
        this.snapshotToItems(sn)
      } finally {
        this.loading = false
      }
    },
    onIntersect (entries, observer, isIntersecting) {
      if (isIntersecting) this.more()
    },
    async save () {
      if (!this.fireUser) throw Error('로그인이 필요합니다')
      if (!this.comment) throw Error('내용을 작성해야 합니다')
      if (this.comment.length > 300) throw Error('문자 허용치를 넘었습니다')
      const doc = {
        createdAt: new Date(),
        updatedAt: new Date(),
        comment: this.comment,
        uid: this.$store.state.fireUser.uid,
        user: {
          email: this.user.email,
          photoURL: this.user.photoURL,
          displayName: this.user.displayName
        },
        likeCount: 0,
        likeUids: []
      }
      const id = doc.createdAt.getTime().toString()
      this.docRef.collection('comments').doc(id).set(doc)
      this.comment = ''
    },
    liked (item) {
      if (!this.fireUser) return false
      return item.likeUids.includes(this.fireUser.uid)
    },
    async like (comment) {
      if (!this.fireUser) throw Error('로그인이 필요합니다')
      if (this.liked(comment)) {
        await this.docRef.collection('comments').doc(comment.id).update({
          likeCount: this.$firebase.firestore.FieldValue.increment(-1),
          likeUids: this.$firebase.firestore.FieldValue.arrayRemove(this.fireUser.uid)
        })
      } else {
        await this.docRef.collection('comments').doc(comment.id).update({
          likeCount: this.$firebase.firestore.FieldValue.increment(1),
          likeUids: this.$firebase.firestore.FieldValue.arrayUnion(this.fireUser.uid)
        })
      }
      if (this.items.findIndex(el => el.id === comment.id) < LIMIT) return
      const doc = await this.docRef.collection('comments').doc(comment.id).get()
      const item = doc.data()
      comment.comment = item.comment
      comment.likeCount = item.likeCount
      comment.likeUids = item.likeUids
    },
    async remove (comment) {
      await this.docRef.collection('comments').doc(comment.id).delete()
      const i = this.items.findIndex(el => el.id === comment.id)
      this.items.splice(i, 1)
    }
  }
}
</script>
<style scoped>
.comment {
  white-space: pre-wrap;
}
</style>
