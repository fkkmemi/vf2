<template>
  <v-card>
    <v-card-title>
      <v-textarea v-model="comment" rows="3" outlined label="댓글 작성" append-icon="mdi-send" @click:append="save" hide-details></v-textarea>
    </v-card-title>
    <template v-for="(item, i) in items">
      <v-list-item :key="item.id">
        <v-list-item-action>
          <display-user :user="item.user"></display-user>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-subtitle class="black--text comment" v-text="item.comment"></v-list-item-subtitle>
          <v-list-item-subtitle class="font-italic">
            <display-time :time="item.createdAt"></display-time>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider :key="i"></v-divider>
    </template>
    <v-list-item>
      <v-btn v-if="lastDoc && items.length < article.commentCount" @click="more" v-intersect="onIntersect" text color="primary" block>더보기</v-btn>
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
      lastDoc: null
    }
  },
  computed: {
    user () {
      return this.$store.state.user
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
        const exists = this.items.some(item => doc.id === item.id)
        if (!exists) {
          const item = doc.data()
          item.id = doc.id
          item.createdAt = item.createdAt.toDate()
          item.updatedAt = item.updatedAt.toDate()
          this.items.push(item)
        }
      })
      this.items.sort((before, after) => {
        const beforeId = Number(before.id)
        const afterId = Number(after.id)
        return afterId - beforeId
      })
    },
    subscribe () {
      if (this.unsubscribe) this.unsubscribe()
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
      const sn = await this.docRef.collection('comments').orderBy('createdAt', 'desc').startAfter(this.lastDoc).limit(LIMIT).get()
      this.snapshotToItems(sn)
    },
    onIntersect (entries, observer, isIntersecting) {
      if (isIntersecting) this.more()
    },
    async save () {
      const doc = {
        createdAt: new Date(),
        updatedAt: new Date(),
        comment: this.comment,
        uid: this.$store.state.fireUser.uid,
        user: {
          email: this.user.email,
          photoURL: this.user.photoURL,
          displayName: this.user.displayName
        }
      }
      const id = doc.createdAt.getTime().toString()
      // const batch = this.$firebase.firestore().batch()
      // batch.update(this.docRef, { commentCount: this.$firebase.firestore.FieldValue.increment(1) })
      // batch.set(this.docRef.collection('comments').doc(id), doc)
      // await batch.commit()
      this.docRef.collection('comments').doc(id).set(doc)
      this.comment = ''
    }
  }
}
</script>
<style scoped>
.comment {
  white-space: pre-wrap;
}
</style>
