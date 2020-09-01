<template>
  <articles :boardId="board" :category="category" :uid="uid" />
</template>
<script>
import Articles from '@/components/article'
import setMeta from '@/util/setMeta'
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
  },
  created () {
    setMeta({
      title: '전체게시물',
      description: '전체게시물을 조회하는 페이지',
      image: '/logo.png'
    })
  }
}
</script>
