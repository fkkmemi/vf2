<template>
  <v-list-item :to="`/user/${item.id}`">
    <v-list-item-avatar>
      <v-img :src="item.photoURL"></v-img>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>
        {{item.displayName}}
      </v-list-item-title>
      <v-list-item-subtitle>
        <v-icon left x-small :color="item.online ? 'success' : 'error'">mdi-circle</v-icon>
        <span class="cation"><display-time :time="item.visitedAt"/></span>
      </v-list-item-subtitle>
    </v-list-item-content>
    <!-- <v-list-item-action>
      <v-btn :to="`/user/${item.id}`" icon><v-icon>mdi-arrow-right-bold-circle-outline</v-icon></v-btn>
    </v-list-item-action> -->
    <v-list-item-action>
      <v-btn @click="chat(item)" icon><v-icon>mdi-chat</v-icon></v-btn>
    </v-list-item-action>
  </v-list-item>
</template>
<script>
import DisplayTime from '@/components/display-time'
export default {
  components: { DisplayTime },
  props: ['item'],
  methods: {
    chat (item) {

    }
  }
}
</script>
