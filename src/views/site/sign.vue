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
      <!-- <v-badge
        overlap
        dot
        color="error"
        :value="!user.emailVerified"
      > -->
        <v-btn icon v-on="on">
          <v-avatar size="32">
            <v-img :src="user.photoURL"></v-img>
          </v-avatar>
        </v-btn>
      <!-- </v-badge> -->
    </template>
    <v-card>
      <v-list>
        <v-list-item>
          <v-list-item-avatar>
            <v-img :src="user.photoURL" alt="avatar"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>닉네임</v-list-item-title>
            <v-list-item-subtitle v-text="user.displayName"></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-avatar>
            <v-badge overlap dot :value="!user.emailVerified" color="error">
              <v-icon v-if="user.providerId === 'password'" color="primary">
                mdi-email
              </v-icon>
              <v-icon v-if="user.providerId === 'google.com'" color="#dd4b39">
                mdi-google
              </v-icon>
              <v-icon v-if="user.providerId === 'github.com'" color="#242a2e">
                mdi-github
              </v-icon>
              <v-icon v-if="user.providerId === 'facebook.com'" color="#242a2e">
                mdi-facebook
              </v-icon>
            </v-badge>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>이메일</v-list-item-title>
            <v-list-item-subtitle v-text="user.email"></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-avatar>
            <v-icon>mdi-badge-account-alert-outline</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>권한</v-list-item-title>
            <v-list-item-subtitle v-text="levelStr"></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item :to="`/user/${user.uid}`">
          <v-list-item-avatar>
            <v-icon>mdi-account-search</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>나의 페이지</v-list-item-title>
            <v-list-item-subtitle>작성한 글 모음</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-icon>mdi-arrow-right-bold-circle-outline</v-icon>
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <v-divider/>
      <v-card-actions>
        <v-spacer/>
        <v-btn color="primary" @click="signOut">
          <v-icon left>mdi-exit-to-app</v-icon>
          로그아웃
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>
<script>
import DialogSign from '@/components/dialog-sign'
import constants from '@/util/constants'

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
    },
    levelStr () {
      if (!this.user) return ''
      return constants.levels.find(v => v.value === this.user.level).text
    }
  },
  methods: {
    signOut () {
      this.$firebase.auth().signOut()
    },
    emailConfirm () {
      // location.reload()
      this.$firebase.auth().currentUser.getIdToken(true)
    }
  }
}
</script>
