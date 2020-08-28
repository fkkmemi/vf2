<template>
  <v-list-item>
    <v-list-item-icon>
      <v-icon>mdi-brightness-6</v-icon>
    </v-list-item-icon>
    <v-list-item-content>
      <v-list-item-title>테마 변경</v-list-item-title>
      <v-list-item-subtitle>밝은 테마와 어두운 테마로 조정이 가능합니다</v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action>
      <v-switch
        :value="$vuetify.theme.dark"
        @change="toggleDark"/>
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
