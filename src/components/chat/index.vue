<template>
  <v-navigation-drawer
    v-model="drawer"
    :permanent="permanent"
    app
    fixed
    right
    disable-resize-watcher
    >
    <template v-slot:prepend>
      <chat-head
        @close="close"
        :permanent="permanent"
        @lock="lock" />
    </template>
    <template v-slot:default v-if="drawer">
      <template v-if="!selectedItem">
        <v-tabs v-model="tab" centered>
          <v-tab>
            <v-icon left>mdi-account</v-icon> 사용자
          </v-tab>
          <v-tab>
            <v-icon left>mdi-chat</v-icon> 대화
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab" class="mt-4">
          <v-tab-item>
            <user-list
              @select="selectItem"
            />
          </v-tab-item>
          <v-tab-item>
            <chat-list @select="selectItem"/>
          </v-tab-item>
        </v-tabs-items>
      </template>
      <template v-else>
        <chat-room
          @select="selectItem"
          :selectedUser="selectedItem"
        />
      </template>
    </template>
    <template v-slot:append>
      <chat-input v-if="selectedItem" :selectedUser="selectedItem" />
    </template>
  </v-navigation-drawer>

</template>
<script>
import ChatHead from './head'
import UserList from './user-list'
import ChatList from './chat-list'
import ChatRoom from './room'
import ChatInput from './input'
export default {
  components: { ChatHead, UserList, ChatList, ChatRoom, ChatInput },
  props: ['drawerStart'],
  data () {
    return {
      drawer: false,
      permanent: false,
      selectedItem: null,
      tab: null
    }
  },
  watch: {
    drawerStart (n) {
      this.drawer = n
    },
    drawer (n) {
      if (!n) this.$emit('close')
    }
  },
  methods: {
    close () {
      this.permanent = false
      this.drawer = false
    },
    lock (pin) {
      this.permanent = pin
    },
    selectItem (item) {
      this.selectedItem = item
    }
  }
}
</script>
