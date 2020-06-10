<template>
  <v-sheet>
    sss
    <v-btn @click="write">write</v-btn>
  </v-sheet>
</template>
<script>
export default {
  data () {
    return {
      text: ''
    }
  },
  methods: {
    async write () {
      const sn = await this.$firebase.storage().ref().child('xxx.text').putString('abcd')
      const url = await sn.ref.getDownloadURL()
      console.log(url)
    }
  }
}
</script>
