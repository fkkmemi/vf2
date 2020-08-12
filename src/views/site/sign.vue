<template>
  <v-progress-circular indeterminate v-if="loading"></v-progress-circular>
  <v-dialog
    v-else-if="!user"
    v-model="dialog"
    max-width="800"
    :fullscreen="$vuetify.breakpoint.xs"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        icon
        dark
        v-bind="attrs"
        v-on="on"
      >
        <v-icon>mdi-account</v-icon>
      </v-btn>
    </template>
    <dialog-sign @close="dialog=false" />
  </v-dialog>
  <v-menu offset-y v-else :close-on-content-click="false">
    <template v-slot:activator="{ on }">
      <v-btn icon v-on="on">
        <v-avatar size="32">
          <v-img :src="user.photoURL"></v-img>
        </v-avatar>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>정보</v-card-title>
      <v-card-actions>
        <v-btn color="" dark @click="signOut" block>로그아웃</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>
<script>
import DialogSign from '@/components/dialog-sign'

export default {
  components: { DialogSign },
  data () {
    return {
      loading: false,
      dialog: false
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  methods: {
    signOut () {
      this.$firebase.auth().signOut()
    }
  }
}
</script>
