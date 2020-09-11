<template>
  <v-container fluid :class="$vuetify.breakpoint.xs ? 'pa-0' : ''">
    <v-card outlined :tile="$vuetify.breakpoint.xs">
      <v-toolbar color="transparent" dense flat>
        <v-toolbar-title>
          데이터 정리
        </v-toolbar-title>
      </v-toolbar>
      <v-divider/>
      <v-card-text>
        <v-textarea v-model="text" outlined/>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="runIndexing" color="warning">재생성</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
<script>
import axios from 'axios'

export default {
  data () {
    return {
      text: '',
      token: ''
    }
  },
  computed: {
    fireUser () {
      return this.$store.state.fireUser
    }
  },
  methods: {
    async runIndexing () {
      try {
        this.token = await this.fireUser.getIdToken()
        const url = 'http://localhost:5000/memi-blog/asia-northeast1/api/admin/indexing'
        const body = { action: 'start' }
        const options = {
          headers: { authorization: this.token }
        }
        const { data } = await axios.post(url, body, options)
        this.text = JSON.stringify(data, null, 2)
      } catch (e) {
        this.text = e.message
      }
    }
  }
}
</script>
