<template>
  <board-search :text="text" />
</template>
<script>
import BoardSearch from '@/components/board/search'
export default {
  components: { BoardSearch },
  computed: {
    text () {
      return this.$route.query.text
    }
  }
}
</script>
