<template>
  <board v-if="!action" :boardId="id" :category="category" />
  <board-form v-else :boardId="id" :action="action" />
</template>
<script>
import Board from '@/components/board'
import BoardForm from '@/components/board/form'
export default {
  components: { Board, BoardForm },
  computed: {
    id () {
      return this.$route.params.id
    },
    action () {
      return this.$route.query.action
    },
    category () {
      return this.$route.query.category
    }
  }
}
</script>
