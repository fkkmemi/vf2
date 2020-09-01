<template>
  <comments :board="board" :id="id" :category="category" :uid="uid"/>
</template>
<script>
import Comments from '@/components/comment'
export default {
  components: { Comments },
  computed: {
    board () {
      return this.$route.query.board
    },
    id () {
      return this.$route.query.id
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
