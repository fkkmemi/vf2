<template>
  <v-banner :single-line="!$vuetify.breakpoint.xs" color="warning" dark>
    <v-icon left>mdi-information</v-icon>
    이메일 확인이 필요합니다
    <template v-slot:actions>
      <v-btn color="primary" @click="sendEmailVerification">
        <v-icon left>mdi-email-sync</v-icon>
        확인메일 재전송
      </v-btn>
      <v-btn color="primary" @click="emailConfirm">
        <v-icon left>mdi-email-check</v-icon>
        확인되었음
      </v-btn>
    </template>
  </v-banner>
</template>
<script>
export default {
  methods: {
    data () {
      return {
        visible: true
      }
    },
    sendEmailVerification () {
      this.$firebase.auth().currentUser.sendEmailVerification()
      this.$toasted.global.notice(`이메일을 재전송 하였습니다. ${this.$firebase.auth().currentUser.email}의 이메일을 확인해주세요`)
    },
    emailConfirm () {
      // location.reload()
      this.$firebase.auth().currentUser.getIdToken(true)
      this.$toasted.global.notice('이메일 확인이 되면 글을 작성할 수 있습니다')
      setTimeout(() => {
        location.reload()
      }, 1000)
    }
  }
}
</script>
