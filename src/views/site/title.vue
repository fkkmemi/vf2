<template>
  <v-toolbar-title class="d-flex align-center">
    <v-avatar left size="28">
      <v-img src="/logo.png" left></v-img>
    </v-avatar>
    <v-tooltip bottom>
      <template v-slot:activator="{on}">
        <span v-on="on" class="font-weight-light primary--text ml-2">
          {{ title }}
        </span>
      </template>
      <span>{{site.title}} {{site.description}}</span>
    </v-tooltip>
    <v-btn v-if="$store.state.editable" icon @click="openDialog">
      <v-icon small>mdi-tools</v-icon>
    </v-btn>
    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title>
          사이트 제목 수정
          <v-spacer/>
          <v-btn icon @click="save"><v-icon small>mdi-content-save</v-icon></v-btn>
          <v-btn icon @click="dialog=false"><v-icon small>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="text" outlined label="제목" @keypress.enter="save" hide-details />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-toolbar-title>
</template>
<script>
import site from '../../../siteConfig'
export default {
  props: ['title'],
  data () {
    return {
      site,
      dialog: false,
      text: this.title
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  methods: {
    authCheck () {
      if (!this.user) throw Error('로그인이 필요합니다')
      if (this.user.level > 1) throw Error('관리 권한이 필요합니다')
    },
    openDialog () {
      this.dialog = true
      this.text = this.title
    },
    async save () {
      this.authCheck()
      try {
        await this.$firebase.database().ref().child('site').update({ title: this.text })
      } finally {
        this.dialog = false
      }
    }
  }
}
</script>
