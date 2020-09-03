<template>
  <v-container v-if="!loaded" fluid>
    <v-skeleton-loader type="article" v-for="i in 4" :key="i"></v-skeleton-loader>
  </v-container>
  <!-- <v-container fluid v-else-if="loaded && result && !result.hits.length">
    <v-alert type="warning" border="left" class="mb-0">
      검색된 내용이 없습니다
    </v-alert>
  </v-container> -->
  <v-container v-else fluid class="">
    <v-text-field
      v-model="search"
      label="검색"
      solo
      prepend-inner-icon="mdi-magnify"
      clearable
      @keypress.enter="find"
    ></v-text-field>
    <v-alert border="left" color="info" outlined v-if="result">
      <v-card-title class="body-1">
        <v-icon>mdi-magnify</v-icon>
        <span class="font-weight-bold mr-1">{{result.query}}</span>
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
      page: 0,
      search: this.text
    }
  },
  watch: {
    text (n) {
      this.search = n
      this.init()
      this.fetch()
    }
  },
  created () {
    this.find()
  },
  destroyed () {
  },
  methods: {
    init () {
      setMeta({
        title: '검색 ' + this.text,
        description: '검색 ' + this.text,
        image: '/logo.png'
      })
      this.page = 0
      this.result = null
      this.items = []
    },
    find () {
      this.init()
      this.fetch()
    },
    async fetch () {
      if (this.loading) return
      if (this.search) {
        try {
          if (!this.page) this.loaded = false
          this.loading = true
          const r = await this.$index.search(this.search, {
            page: this.page,
            hitsPerPage: 5
          })
          r.hits.forEach(hit => {
            const exists = this.items.some(item => item.objectID === hit.objectID)
            if (!exists) this.items.push(hit)
          })
          this.result = r
        } finally {
          this.loaded = true
          this.loading = false
        }
      }
    },
    onIntersect (entries, observer, isIntersecting) {
      if (isIntersecting) {
        this.page++
        this.fetch()
      }
    }
  }
}
</script>
