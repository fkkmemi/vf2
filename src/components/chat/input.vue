<template>
  <v-card flat :loading="loading">
    <v-divider/>
    <v-card-actions>
      <v-textarea
        v-model="message"
        auto-grow
        rows="1"
        hide-details
        append-icon="mdi-send"
        placeholder="Ctrl + Enter로 작성 가능"
        @click:append="save"
        @keypress.ctrl.enter="save"
        dense
        outlined/>
    </v-card-actions>
    <v-sheet
      height="120"
      color="transparent"
      v-if="$vuetify.breakpoint.xs">
    </v-sheet>
  </v-card>
</template>
<script>
export default {
  props: ['selectedUser'],
  data () {
    return {
      message: '',
      loading: false
    }
  },
  computed: {
    user () { return this.$store.state.user },
    uids () { return [this.user.uid, this.selectedUser.uid].sort() }
  },
  mounted () {
  },
  methods: {
    async save () {
      const createdAt = new Date()
      const doc = {
        createdAt,
        message: this.message,
        uid: this.user.uid,
        uids: this.uids
      }
      try {
        this.loading = true
        await this.$firebase.firestore()
          .collection('chats').doc(this.uids.join('-'))
          .collection('messages').doc(createdAt.getTime().toString()).set(doc)
      } finally {
        this.loading = false
        this.message = ''
      }
    }
  }
}
</script>
