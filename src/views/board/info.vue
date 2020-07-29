<template>
  <board-content v-if="!action" :boardId="info" />
  <board-form v-else :boardId="info" :action="action" />
</template>
<script>
import BoardContent from '@/components/board/content'
import BoardForm from '@/components/board/form'
export default {
  components: { BoardContent, BoardForm },
  computed: {
    info () {
      return this.$route.params.info
    },
    action () {
      return this.$route.query.action
    }
  }
}
</script>
