<template>
  <user :uid="uid"/>
</template>
<script>
import User from '@/components/user'
import setMeta from '@/util/setMeta'
export default {
  components: { User },
  computed: {
    uid () {
      return this.$route.params.uid
    }
  },
  created () {
    setMeta({
      title: '나의 페이지',
      description: '작성한 글 모음',
      image: '/logo.png'
    })
  }
}
</script>
