<template>
  <v-container v-if="!loaded" fluid>
    <v-skeleton-loader type="article" v-for="i in 4" :key="i"></v-skeleton-loader>
  </v-container>
  <v-container fluid v-else-if="loaded && result && !result.hits.length">
    <v-alert type="warning" border="left" class="mb-0">
      검색된 내용이 없습니다
    </v-alert>
  </v-container>
  <v-container v-else fluid :class="$vuetify.breakpoint.xs ? 'pa-0' : ''">
    검색내용 {{text}}
  </v-container>
</template>
<script>
export default {
  props: ['text'],
  data () {
    return {
      loaded: false,
      result: null
    }
  },
  watch: {
    text () {
      this.fetch()
    }
  },
  created () {
    this.fetch()
  },
  methods: {
    async fetch () {
      if (this.text) this.$store.commit('setSearchText', this.text)
      try {
        if (this.text.length < 2) throw Error('최소 2글자 이상 입력하세요.. 돈이 없어서 한글자는 힘들어요')
        this.result = await this.$index.search(this.text)
        console.log(JSON.stringify(this.result, 2, null))
      } catch (e) {
        this.$toasted.global.error(e.message)
      } finally {
        this.loaded = true
      }
    }
  }
}
</script>
