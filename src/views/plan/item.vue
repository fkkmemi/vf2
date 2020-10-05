<template>
  <plan-item :id="id" />
</template>
<script>
import PlanItem from '@/components/plan/item.vue'
export default {
  components: { PlanItem },
  computed: {
    id () {
      return this.$route.params.id
    }
  }
}
</script>
