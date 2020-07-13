<template>
  <v-card>
    <v-card-title>
      <v-text-field v-model="comment" outlined label="댓글 작성" @keypress.enter="save" hide-details></v-text-field>
    </v-card-title>
    <template v-for="(item, i) in items">
      <v-list-item :key="item.id">
        <v-list-item-action>
          <display-user :user="item.user"></display-user>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-subtitle v-text="item.comment"></v-list-item-subtitle>
          <v-list-item-subtitle>
            <display-time :time="item.createdAt"></display-time>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider :key="i"></v-divider>
    </template>
    <v-list-item>
      <v-btn @click="more" text color="primary" block>더보기</v-btn>
    </v-list-item>
  </v-card>
</template>
<script>

import DisplayTime from '@/components/display-time'
import DisplayUser from '@/components/display-user'

export default {
  components: { DisplayTime, DisplayUser },
  props: ['docRef'],
  data () {
    return {
      comment: '',
      items: [],
      unsubscribe: null,
      limit: 5
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
    subscribe () {
      if (this.unsubscribe) this.unsubscribe()
      this.unsubscribe = this.docRef.collection('comments').limit(this.limit).onSnapshot(sn => {
        if (sn.empty) {
          this.items = []
          return
        }
        this.items = sn.docs.map(doc => {
          const item = doc.data()
          item.id = doc.id
          item.createdAt = item.createdAt.toDate()
          item.updatedAt = item.updatedAt.toDate()
          return item
        })
      })
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
      const batch = this.$firebase.firestore().batch()
      batch.update(this.docRef, { commentCount: this.$firebase.firestore.FieldValue.increment(1) })
      batch.set(this.docRef.collection('comments').doc(id), doc)
      await batch.commit()
      this.comment = ''
    },
    more () {
      this.limit += 5
      this.subscribe()
    }
  }
}
</script>
