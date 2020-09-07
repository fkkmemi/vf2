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
      <chat-head @close="close" :permanent="permanent" @lock="lock" />
    </template>
    <template v-slot:default>
      <chat-list/>
    </template>
    <template v-slot:append>
      <v-card color="red">bottom</v-card>
    </template>
  </v-navigation-drawer>

</template>
<script>
import ChatHead from './head'
import ChatList from './list'
export default {
  components: { ChatHead, ChatList },
  props: ['drawerStart'],
  data () {
    return {
      drawer: false,
      permanent: false
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
    }
  }
}
</script>
