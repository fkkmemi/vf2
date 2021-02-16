<template>
  <v-container fluid v-if="!loaded">
    <v-skeleton-loader type="article"></v-skeleton-loader>
  </v-container>
  <v-container fluid v-else>
    <v-alert v-if="!empty" type="warning" border="left" class="mb-0">
      검색된 게시판이 없습니다
    </v-alert>
  </v-container>
</template>
<script>
import setMeta from '@/util/setMeta'

export default {
  data () {
    return {
      empty: false,
      loaded: false
    }
  },
  mounted () {
    setMeta({ title: '메인페이지', description: '메인페이지', image: '/logo.png' })
    this.goPage()
  },
  methods: {
    async goPage () {
      const sn = await this.$firebase.firestore()
        .collection('boards').orderBy('count', 'desc').limit(1).get()
      this.loaded = true
      if (sn.empty) return
      this.empty = sn.empty
      this.$router.push('/board/' + sn.docs[0].id)
    }
  }
}
</script>
