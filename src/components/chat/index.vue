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
      <chat-list
        v-if="!selectedItem"
        @select="selectItem"
      />
      <chat-room
        v-else
        @select="selectItem"
        :selectedUser="selectedItem"
      />
    </template>
    <template v-slot:append>
      <chat-input v-if="selectedItem" :selectedUser="selectedItem" />
    </template>
  </v-navigation-drawer>

</template>
<script>
import ChatHead from './head'
import ChatList from './list'
import ChatRoom from './room'
import ChatInput from './input'
export default {
  components: { ChatHead, ChatList, ChatRoom, ChatInput },
  props: ['drawerStart'],
  data () {
    return {
      drawer: false,
      permanent: false,
      selectedItem: null
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
