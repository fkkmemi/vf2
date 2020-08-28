<template>
  <settings />
</template>
<script>
import Settings from '@/components/settings/index.vue'
export default {
  components: { Settings },
  created () {
    console.log(this.$vuetify.theme)
  },
  methods: {

  }
}
</script>
