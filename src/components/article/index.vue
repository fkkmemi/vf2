<template>
  <v-card>
    article
    {{ board }}
    {{ category }}
    {{ uid }}
  </v-card>
</template>
<script>
export default {
  props: ['board', 'category', 'uid']
}
</script>
