<template>
  <v-container v-if="!loaded" fluid>
    <v-skeleton-loader type="article" v-for="i in 4" :key="i"></v-skeleton-loader>
  </v-container>
  <v-container fluid v-else-if="loaded && result && !result.hits.length">
    <v-alert type="warning" border="left" class="mb-0">
      검색된 내용이 없습니다
    </v-alert>
  </v-container>
  <v-container v-else fluid class="">
    <v-alert border="left" color="info" outlined>
      <v-card-title class="body-1">
        <v-icon>mdi-magnify</v-icon>
        <span class="font-weight-bold mr-1">{{text}}</span>
        (으)로 검색된 게시물 은 총
        <span class="font-weight-bold ml-1">{{result.nbHits}}</span>
        건 입니다
        <v-spacer/>
        <!-- free plan need logo!! https://www.algolia.com/press/?section=guidelines -->
        <v-img contain :max-width="120" src="https://res.cloudinary.com/hilnmyskv/image/upload/q_auto/v1595410010/Algolia_com_Website_assets/images/shared/algolia_logo/search-by-algolia-light-background.svg"></v-img>
      </v-card-title>
    </v-alert>
    <template v-for="(item) in items">
      <display-search-item :item="item" :key="item.objectId" />
    </template>
    <v-list-item v-if="items.length < result.nbHits">
      <v-btn
        @click="fetch"
        v-intersect="onIntersect"
        text
        color="primary"
        block
        :loading="loading">
        <v-icon>mdi-dots-horizontal</v-icon>더보기
      </v-btn>
    </v-list-item>

  </v-container>
</template>
<script>
import DisplaySearchItem from '@/components/display-search-item'
import setMeta from '@/util/setMeta'

export default {
  components: { DisplaySearchItem },
  props: ['text'],
  data () {
    return {
      loaded: false,
      result: null,
      loading: false,
      items: [],
      page: 0
    }
  },
  watch: {
    text () {
      this.init()
      this.fetch()
    }
  },
  created () {
    this.init()
    this.fetch()
  },
  destroyed () {
    if (this.text) this.$store.commit('setSearchText', '')
  },
  methods: {
    init () {
      if (this.text) this.$store.commit('setSearchText', this.text)
      setMeta({
        title: '검색 ' + this.text,
        description: '검색 ' + this.text,
        image: '/logo.png'
      })
      this.page = 0
      this.result = null
      this.items = []
    },
    async fetch () {
      if (this.loading) return
      if (this.result && (this.result.nbHits === this.items.length)) return
      try {
        if (!this.page) this.loaded = false
        this.loading = true
        const r = await this.$index.search(this.text, {
          page: this.page++,
          hitsPerPage: 5
        })
        // const items = r.hits.map(hit => {
        //   const item = hit
        //   item.content = hit.content.substr(0, 300)
        //   item.createdAt = new Date(hit.createdAt)
        //   item.updatedAt = new Date(hit.updatedAt)
        //   return item
        // })
        // this.items = this.items.concat(items)
        r.hits.forEach(hit => {
          const exists = this.items.some(item => item.objectID === hit.objectID)
          if (!exists) {
            const item = hit
            item.content = hit.content.substr(0, 300)
            item.createdAt = new Date(hit.createdAt)
            item.updatedAt = new Date(hit.updatedAt)
            this.items.push(item)
          }
        })
        this.result = r
      } finally {
        this.loaded = true
        this.loading = false
      }
    },
    onIntersect (entries, observer, isIntersecting) {
      if (isIntersecting) this.fetch()
    }
  }
}
</script>
