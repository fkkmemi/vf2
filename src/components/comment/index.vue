<template>
  <v-card>
    comment
    {{ board }}
    {{ id }}
    {{ category }}
    {{ uid }}
  </v-card>
</template>
<script>
export default {
  props: ['board', 'id', 'category', 'uid']
}
</script>
