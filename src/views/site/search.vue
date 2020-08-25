<template>
  <!-- <v-sheet color="transparent" :width="$vuetify.breakpoint.xs ? 100 : 200"> -->
    <v-autocomplete
      v-model="text"
      solo-inverted
      flat
      hide-details
      label="검색"
      dense
      clearable
      :search-input.sync="search"
      :items="result.hits"
      :loading="loading"
      hide-selected
      :hide-no-data="!search"
      item-value="title"
      item-text="title"
      :menu-props="{
        // auto: true,
        // closeOnClick: true
        // value: menu,
        maxHeight:500
      }"
      no-filter
    >
    <!--

      :hide-no-data="result.nbHits.length ? true : false"
     -->
      <!-- no-filter open-on-clear -->
      <template v-slot:no-data>
        <v-list-item>
          <v-list-item-content>
            검색 결과가 없습니다
          </v-list-item-content>
          <!-- <v-list-item-icon>
            <v-img contain :max-width="120" src="https://res.cloudinary.com/hilnmyskv/image/upload/q_auto/v1595410010/Algolia_com_Website_assets/images/shared/algolia_logo/search-by-algolia-light-background.svg"></v-img>
          </v-list-item-icon> -->
        </v-list-item>
      </template>
      <template v-slot:item="{ on, item }">
        <v-list-item three-line v-on="on" @click="goTo(item)">
          <v-list-item-content>
            <v-list-item-title class="d-flex justify-space-between align-center" v-if="$vuetify.breakpoint.xs">
              <v-chip color="primary" label small class="">
                {{item.boardId}}
              </v-chip>
              <v-spacer/>
              <span class="caption font-italic">
                <display-time :time="item.createdAt"/>
              </span>
            </v-list-item-title>
            <v-list-item-title class="d-flex justify-space-between align-center">
              <v-chip color="primary" label small class="mr-2 hidden-xs-only">
                {{item.boardId}}
              </v-chip>
              {{item.title}}
              <v-spacer/>
              <span class="caption font-italic hidden-xs-only">
                <display-time :time="item.createdAt"/>
              </span>
            </v-list-item-title>
            <v-list-item-subtitle>
              {{item.content}}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>
      <template v-slot:append-item>
        <v-list-item>
          <v-list-item-content>
            <template v-if="search && result.nbHits > 5">
              <v-btn text color="primary" @click="find">
                <v-icon left>mdi-dots-horizontal</v-icon>더보기
                <v-chip color="primary" small class="mx-4 hidden-xs-only">{{result.nbHits - result.hitsPerPage}}</v-chip>
              </v-btn>
            </template>
          </v-list-item-content>
          <v-list-item-action>
            <v-img contain :max-width="120" src="https://res.cloudinary.com/hilnmyskv/image/upload/q_auto/v1595410010/Algolia_com_Website_assets/images/shared/algolia_logo/search-by-algolia-light-background.svg"></v-img>
          </v-list-item-action>
        </v-list-item>
      </template>
    </v-autocomplete>
  <!-- </v-sheet> -->
</template>
<script>
import DisplayTime from '@/components/display-time'

export default {
  components: { DisplayTime },
  data () {
    return {
      text: null,
      search: null,
      result: {
        hits: [],
        hitsPerPage: 5,
        nbHits: 0,
        page: 0
      },
      loading: false,
      timer: null
    }
  },
  watch: {
    search (n) {
      if (!n) {
        this.initData()
        return
      }
      clearTimeout(this.timer)
      this.loading = true
      this.timer = setTimeout(() => {
        this.fetch()
      }, 500)
    }
  },
  methods: {
    initData () {
      this.result = {
        hits: [],
        hitsPerPage: 5,
        nbHits: 0,
        page: 0
      }
    },
    async fetch () {
      try {
        if (!this.search) return
        this.result = await this.$index.search(this.search, { hitsPerPage: 5 })
      } finally {
        this.loading = false
      }
    },
    find () {
      if (!this.search) return
      const to = {}
      if (this.$route.path !== '/search') to.path = '/search'
      if (this.$route.query.text !== this.search) to.query = { text: this.search }
      if (!Object.keys(to).length) return
      this.search = null
      this.$router.push(to)
    },
    goTo (item) {
      this.search = null
      const to = `/board/${item.boardId}/${item.articleId}`
      this.$router.push(to)
    }
  }
}
</script>
