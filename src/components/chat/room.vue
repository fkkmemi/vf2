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
          <v-btn v-on="on" icon :to="`/user/${selectedUser.id}`">
            <v-icon>mdi-arrow-right-bold-circle-outline</v-icon>
          </v-btn>
        </template>
        <span>사용자 활동 보기</span>
      </v-tooltip>
    </v-toolbar>
    <v-divider/>
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
import DisplayTime from '@/components/display-time'
export default {
  components: { DisplayTime },
  props: ['selectedUser'],
  computed: {
    user () { return this.$store.state.user },
    uids () { return [this.user.uid, this.selectedUser.id].sort() }
  },
  data () {
    return {
      items: [],
      unsubscribe: null
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
    subscribe () {
      this.unsubscribe = this.$firebase.firestore()
        .collection('chats').doc(this.uids.join('-'))
        .collection('messages')
        .limit(1000)
        .onSnapshot(sn => {
          this.items = sn.docs.map(doc => {
            const item = doc.data()
            item.id = doc.id
            item.createdAt = item.createdAt.toDate()
            return item
          })
        }, (e) => console.error('messages subscribe err: ' + e.message))
    }
  }
}
</script>
