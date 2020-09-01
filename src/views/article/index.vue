<template>
  <articles :board="board" :category="category" :uid="uid" />
</template>
<script>
import Articles from '@/components/article'
export default {
  components: { Articles },
  computed: {
    board () {
      return this.$route.query.board
    },
    category () {
      return this.$route.query.category
    },
    uid () {
      return this.$route.query.uid
    }
  }
}
</script>
