<template>
  <v-menu offset-y v-model="menu">
    <template v-slot:activator="{ on }">
      <v-chip v-on="on" color="accent" :small="size === 'small'" :outlined="size === 'small'" :to="uid ? null : `/search?text=${user.displayName}`">
        <v-avatar left v-if="size !== 'small'">
          <v-img :src="user.photoURL"/>
        </v-avatar>
        <span class="text-truncate">{{size === 'small' ? user.displayName.substr(0, 5) : user.displayName}}</span>
      </v-chip>
    </template>
    <v-list>
      <v-list-item v-if="!fsuser">
        <v-list-item-avatar>
          <v-progress-circular indeterminate/>
        </v-list-item-avatar>
        <v-list-item-content>
          사용자 정보를 불러오는중
        </v-list-item-content>
      </v-list-item>
      <template v-else>
        <v-list-item>
          <v-list-item-avatar>
            <v-img :src="fsuser.photoURL" alt="avatar"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>닉네임</v-list-item-title>
            <v-list-item-subtitle v-text="fsuser.displayName"></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-avatar>
            <v-badge overlap dot :value="!fsuser.emailVerified" color="error">
              <v-icon v-if="fsuser.providerId === 'password'" color="primary">
                mdi-email
              </v-icon>
              <v-icon v-if="fsuser.providerId === 'google.com'" color="#dd4b39">
                mdi-google
              </v-icon>
              <v-icon v-if="fsuser.providerId === 'github.com'" color="#242a2e">
                mdi-github
              </v-icon>
              <v-icon v-if="fsuser.providerId === 'facebook.com'" color="#242a2e">
                mdi-facebook
              </v-icon>
            </v-badge>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>이메일</v-list-item-title>
            <v-list-item-subtitle v-text="fsuser.email"></v-list-item-subtitle>
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
        <v-list-item :to="`/user/${uid}`">
          <v-list-item-avatar>
            <v-icon>mdi-account-search</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>작성글 검색</v-list-item-title>
            <!-- <v-list-item-subtitle>작성한 글 모음</v-list-item-subtitle> -->
          </v-list-item-content>
          <v-list-item-action>
            <v-icon>mdi-arrow-right-bold-circle-outline</v-icon>
          </v-list-item-action>
        </v-list-item>
      </template>
    </v-list>
  </v-menu>
</template>
<script>
import constants from '@/util/constants'
export default {
  props: ['user', 'size', 'uid'],
  data () {
    return {
      menu: false,
      fsuser: null
    }
  },
  computed: {
    levelStr () {
      if (!this.fsuser) return ''
      return constants.levels.find(v => v.value === this.fsuser.level).text
    }
  },
  watch: {
    menu (n) {
      if (n) this.fetch()
    }
  },
  methods: {
    async fetch () {
      const doc = await this.$firebase.firestore().collection('users').doc(this.uid).get()
      this.fsuser = doc.data()
    }
  }
}
</script>
