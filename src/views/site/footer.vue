<template>
  <v-footer app :color="$vuetify.theme.dark ? null : 'white'" absolute :footer="footer" class="pa-0">
    <v-card tile flat color="" width="100%">
      <v-divider v-if="!$vuetify.theme.dark"/>
      <v-subheader :class="$vuetify.breakpoint.xs ? 'px-1' : null">
        <v-btn text to="/privacy" class="caption">개인정보처리방침</v-btn> |
        <v-btn text to="/terms" class="caption">이용약관</v-btn>
        <v-spacer></v-spacer>
        <span class="caption">{{ footer }}</span>
        <v-btn v-if="$store.state.editable" icon @click="openDialog" small><v-icon small>mdi-pencil</v-icon></v-btn>
        <v-dialog v-model="dialog" max-width="400">
          <v-card>
            <v-card-title>
              바닥글 수정
              <v-spacer/>
              <v-btn icon @click="save"><v-icon>mdi-content-save</v-icon></v-btn>
              <v-btn icon @click="dialog=false"><v-icon>mdi-close</v-icon></v-btn>
            </v-card-title>
            <v-card-text>
              <v-text-field v-model="text" outlined label="바닥글" @keypress.enter="save" hide-details />
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-subheader>
    </v-card>
  </v-footer>
</template>
<script>
export default {
  props: ['footer'],
  data () {
    return {
      dialog: false,
      text: this.footer
    }
  },
  methods: {
    openDialog () {
      this.dialog = true
      this.text = this.footer
    },
    async save () {
      try {
        await this.$firebase.database().ref().child('site').update({ footer: this.text })
      } finally {
        this.dialog = false
      }
    }
  }
}
</script>
