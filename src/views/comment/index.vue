<template>
  <comments :boardId="board" :articleId="id" :category="category" :uid="uid"/>
</template>
<script>
import Comments from '@/components/comment'
import setMeta from '@/util/setMeta'
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
  },
  created () {
    setMeta({
      title: '전체댓글',
      description: '전체댓글을 조회하는 페이지',
      image: '/logo.png'
    })
  }
}
</script>
