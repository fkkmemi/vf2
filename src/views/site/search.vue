<template>
  <!-- <v-sheet color="transparent" width="200"> -->
    <v-text-field
      v-model="text"
      solo-inverted
      flat
      hide-details
      label="검색"
      prepend-inner-icon="mdi-magnify"
      dense
      @keypress.enter="find"
      clearable
    ></v-text-field>
  <!-- </v-sheet> -->
</template>
<script>
export default {
  data () {
    return {
      text: ''
    }
  },
  computed: {
    searchText () {
      return this.$store.state.searchText
    }
  },
  watch: {
    searchText (n) {
      this.text = n
    }
  },
  methods: {
    find () {
      if (!this.text) return
      // if (this.text.length < 2) throw Error('최소 2글자 이상 입력하세요.. 돈이 없어서 한글자는 힘들어요')
      const to = {}
      if (this.$route.path !== '/search') to.path = '/search'
      if (this.$route.query.text !== this.text) to.query = { text: this.text }
      if (!Object.keys(to).length) return
      this.$router.replace(to)
    }
  }
}
</script>
