<template>
  <v-list-item>
    <v-list-item-icon>
      <v-icon>mdi-tools</v-icon>
    </v-list-item-icon>
    <v-list-item-content>
      <v-list-item-title>수정 모드</v-list-item-title>
      <v-list-item-subtitle>제목, 메뉴, 바닥등을 사용자화 합니다</v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action>
      <v-switch
        :value="$store.state.editable"
        @change="$store.commit('setEdit', !$store.state.editable)"/>
    </v-list-item-action>
  </v-list-item>
</template>
<script>
export default {
  methods: {
  }
}
</script>
