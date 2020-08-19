<template>
  <v-container fluid v-if="!user">
    <v-alert type="warning" border="left" class="mb-0">
      설정페이지는 로그인이 필요합니다
    </v-alert>
  </v-container>
  <v-container v-else fluid :class="$vuetify.breakpoint.xs ? 'pa-0' : ''">
    <v-card outlined :tile="$vuetify.breakpoint.xs">
      <v-toolbar color="transparent" dense flat>
        <v-toolbar-title>
          설정
        </v-toolbar-title>
      </v-toolbar>
      <v-divider/>
      <v-card-text>
        준비중...
      </v-card-text>
    </v-card>
  </v-container>

</template>
<script>
export default {
  computed: {
    user () {
      return this.$store.state.user
    }
  }
}
</script>
