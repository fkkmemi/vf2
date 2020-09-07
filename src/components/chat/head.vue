<template>
  <v-toolbar color="primary" dark dense>
    <v-toolbar-title>채팅</v-toolbar-title>
    <v-spacer/>
    <v-btn @click="$emit('lock', !permanent)" icon>
      <v-icon small v-text="permanent ? 'mdi-pin' : 'mdi-pin-off'"></v-icon>
    </v-btn>
    <v-btn @click="$emit('close')" icon>
      <v-icon small>mdi-close</v-icon>
    </v-btn>
  </v-toolbar>
  <!-- <v-list-item>
    <v-list-item-title>채팅</v-list-item-title>
    <v-list-item-action>
      <v-btn @click="$emit('lock', !permanent)" icon small>
        <v-icon v-text="permanent ? 'mdi-pin' : 'mdi-pin-off'"></v-icon>
      </v-btn>
    </v-list-item-action>
    <v-list-item-action>
      <v-btn @click="$emit('close')" icon small>
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item> -->
</template>
<script>
export default {
  props: ['permanent']
}
</script>
