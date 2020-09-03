<template>
  <v-container fluid class="ma-0 iframe d-flex justify-center">
    <v-card dark height="100%">
      <youtube
        :video-id="id"
        :player-vars="playerVars"
        ref="youtube"
        fitParent
        resize></youtube>
    </v-card>
  </v-container>
</template>
<script>
export default {
  props: ['id'],
  data () {
    return {
      playerVars: {
        autoplay: 1
      }
    }
  }
}
</script>
<style scoped>
.iframe {
  width: 100%;
  max-width: 480px; /* Also helpful. Optional. */
}
</style>
