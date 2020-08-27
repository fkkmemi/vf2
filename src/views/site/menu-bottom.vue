<template>
  <v-list-item>
    <v-list-item-content></v-list-item-content>
    <v-list-item-action>
      <v-btn @click="toggleDark" icon>
        <v-icon>mdi-brightness-6</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>
<script>
export default {
  methods: {
    toggleDark () {
      const dark = JSON.parse(localStorage.getItem('site-theme-dark'))
      this.$vuetify.theme.dark = !dark
      localStorage.setItem('site-theme-dark', !dark)
    }
  }
}
</script>
