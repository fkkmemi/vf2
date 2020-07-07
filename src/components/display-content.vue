<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <v-toolbar-title>
        {{item.title}}
      </v-toolbar-title>
      <v-spacer/>
      <v-btn @click="$emit('close')" icon><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>
    <v-card-text>
      {{item.url}}
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  props: ['item'],
  mounted () {
    console.log('mounted')
  }
}
</script>
