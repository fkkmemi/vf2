<template>
  <v-list class="py-0">
    <template v-for="(item, i) in items">
      <v-list-item :three-line="!isWidget" :key="item.id" @click="goTo(item)" :ref="item.id">
        <v-list-item-content>
          <v-list-item-subtitle class="d-flex align-center text--primary body-1">
            <v-btn
              v-if="!$vuetify.breakpoint.xs && category != item.category"
              color="primary"
              depressed
              small
              outlined
              class="mr-4"
              :to="`/board/${boardId}?category=${item.category}`"
            >
              {{item.category}}
              <v-icon right>mdi-menu-right</v-icon>
            </v-btn>
            <display-title :item="item"/>
            <v-spacer/>
          </v-list-item-subtitle>
          <v-list-item-subtitle v-if="!isWidget" class="d-flex justify-space-between align-center">
            <span class="font-italic caption"><display-time :time="item.createdAt"></display-time></span>
            <v-spacer/>
            <v-btn icon v-if="fireUser && fireUser.uid === item.uid" :to="`${boardId}/${item.id}?action=write`"><v-icon>mdi-pencil</v-icon></v-btn>
            <display-user :user="item.user" :size="'small'" :uid="item.uid"></display-user>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action v-if="!isWidget">
          <display-count :item="item" :column="true"></display-count>
        </v-list-item-action>
      </v-list-item>
      <v-divider v-if="i < items.length - 1" :key="i"/>
    </template>
    <v-list-item v-if="isMoreEnable">
      <v-btn
        @click="$emit('more')"
        v-intersect="onIntersect"
        text
        color="primary"
        block
        :loading="loading">
        <v-icon>mdi-dots-horizontal</v-icon>더보기
      </v-btn>
    </v-list-item>
  </v-list>
</template>
<script>
// import { last } from 'lodash'
import DisplayTime from '@/components/display-time'
import DisplayUser from '@/components/display-user'
import DisplayTitle from '@/components/display-title'
import DisplayCount from '@/components/display-count'
import getSummary from '@/util/getSummary'
import addYoutubeIframe from '@/util/addYoutubeIframe'

export default {
  components: { DisplayTime, DisplayUser, DisplayTitle, DisplayCount },
  props: ['items', 'boardId', 'category', 'isWidget', 'isMoreEnable', 'loading'],
  data () {
    return {
      tuiOptions: {
        linkAttribute: {
          target: '_blank'
        }
      },
      getSummary
    }
  },
  computed: {
    fireUser () {
      return this.$store.state.fireUser
    }
  },
  mounted () {
    this.scrollTo()
  },
  methods: {
    goTo (item) {
      const to = {
        path: `/board/${this.boardId}/${item.id}`
      }
      if (this.category) to.query = { category: this.category }
      this.$store.commit('setCachedItem', { boardId: this.boardId, articleId: item.id })
      this.$router.push(to)
    },
    scrollTo () {
      if (this.isWidget) return
      const cached = this.$store.state.cached[this.boardId]
      if (!cached) return
      if (!cached.articleId) return
      if (!this.$refs[cached.articleId]) return
      setTimeout(() => {
        const target = this.$refs[cached.articleId][0]
        if (target) this.$vuetify.goTo(target, { duration: 0 })
      }, 500)
    },
    liked (item) {
      if (!this.fireUser) return false
      return item.likeUids.includes(this.fireUser.uid)
    },
    onViewerLoad (v) {
      addYoutubeIframe(v.preview.el, this.$vuetify.breakpoint)
    },
    onIntersect (entries, observer, isIntersecting) {
      if (isIntersecting) this.$emit('more')
    }
  }
}
</script>
