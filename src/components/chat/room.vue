<template>
  <v-card flat>
    <v-toolbar dense flat>
      <v-btn icon @click="$emit('select', null)"><v-icon>mdi-arrow-left</v-icon></v-btn>
      <v-toolbar-title class="body-1">
        {{this.selectedUser.displayName}}
      </v-toolbar-title>
      <v-spacer/>
      <v-tooltip bottom>
        <template v-slot:activator="{on}">
          <v-btn v-on="on" icon :to="`/user/${selectedUser.uid}`">
            <v-icon>mdi-arrow-right-bold-circle-outline</v-icon>
          </v-btn>
        </template>
        <span>사용자 활동 보기</span>
      </v-tooltip>
    </v-toolbar>
    <v-divider/>
    <v-list-item v-if="firstDoc">
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
    <v-container fluid v-for="(item, i) in items" :key="i" class="">
      <template v-if="item.uid === user.uid">
        <v-row no-gutters>
          <v-spacer/>
          <v-col cols="auto">
            <v-card class="rounded-lg" color="" rounded>
              <v-card-text class="text-right pt-2 pb-0">
                {{item.message}}
              </v-card-text>
              <v-card-actions>
                <v-spacer/>
                <span class="caption font-italic text-right">
                  <display-time :time="item.createdAt" />
                </span>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </template>
      <template v-else>
        <v-row no-gutters>
          <v-col cols="auto">
            <v-card class="rounded-lg" color="" rounded>
              <v-card-text class="pt-2 pb-0">
                {{item.message}}
              </v-card-text>
              <v-card-actions>
                <v-spacer/>
                <span class="caption font-italic">
                  <display-time :time="item.createdAt" />
                </span>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-container>
  </v-card>
</template>
<script>
import { head } from 'lodash'
import DisplayTime from '@/components/display-time'
const itemsSort = (before, after) => {
  return Number(before.id) - Number(after.id)
}
export default {
  components: { DisplayTime },
  props: ['selectedUser'],
  computed: {
    user () { return this.$store.state.user },
    uids () { return [this.user.uid, this.selectedUser.uid].sort() }
  },
  data () {
    return {
      items: [],
      unsubscribe: null,
      firstDoc: null,
      ref: null,
      loading: false,
      loaded: false
    }
  },
  mounted () {
    this.join()
  },
  destroyed () {
    this.destroy()
  },
  methods: {
    destroy () {
      if (this.unsubscribe) this.unsubscribe()
    },
    async join () {
      const doc = await this.$firebase.firestore().collection('chats')
        .doc(this.uids.join('-'))
        .get()
        // .catch(e => console.error('room is empty'))
      if (!doc.exists) {
        const set = {
          uids: this.uids,
          updatedAt: new Date(),
          createdAt: new Date(),
          count: 0,
          users: [this.user, this.selectedUser]
        }
        await this.$firebase.firestore()
          .collection('chats').doc(this.uids.join('-')).set(set)
      }
      this.subscribe()
    },
    snapshotToItems (sn) {
      this.firstDoc = sn.docs.length >= 4 ? head(sn.docs) : null
      sn.docs.forEach(doc => {
        const findItem = this.items.find(item => doc.id === item.id)
        const item = doc.data()
        if (!findItem) {
          item.id = doc.id
          item.createdAt = item.createdAt.toDate()
          this.items.push(item)
        }
      })
      this.items.sort(itemsSort)
    },
    subscribe () {
      this.ref = this.$firebase.firestore()
        .collection('chats').doc(this.uids.join('-'))
        .collection('messages')
        .orderBy('createdAt')
      this.unsubscribe = this.ref
        .limitToLast(4)
        .onSnapshot(sn => {
          this.loaded = true
          // this.items = sn.docs.map(doc => {
          //   const item = doc.data()
          //   item.id = doc.id
          //   item.createdAt = item.createdAt.toDate()
          //   return item
          // })
          this.snapshotToItems(sn)
          this.$store.commit('setMessageCount', this.user.messageCount)
        }, (e) => console.error('messages subscribe err: ' + e.message))
    },
    async more () {
      if (!this.loaded) return
      if (!this.firstDoc) throw Error('더이상 데이터가 없습니다')
      this.loading = true
      try {
        const sn = await this.ref.endBefore(this.firstDoc).limitToLast(4).get()
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
