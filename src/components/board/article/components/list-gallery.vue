<template>
  <v-container fluid>
    <v-row :dense="$vuetify.breakpoint.xs">
      <template v-for="item in items">
        <v-col cols="6" sm="4" md="3" lg="2" :key="item.id">
          <v-card
            height="100%"
            @click="goTo(item)" :ref="item.id">
            <v-system-bar color="transparent">
              <span class="font-italic caption hidden-xs-only text-truncate text--primary"><display-time :time="item.createdAt"></display-time></span>
              <v-spacer/>
              <display-count :item="item" :column="false" size="small"></display-count>
            </v-system-bar>
            <v-divider/>
            <v-img
              v-if="item.level > 5 || (user && user.level <= item.level)"
              :src="srcFromItem(item)"
              :aspect-ratio="1"
              class="align-end"
              :gradient="item.read ? 'rgba(189,189,189,.77), rgba(25,32,72,.77)' : null"

            >
              <template v-slot:placeholder>
                <v-row
                  class="fill-height ma-0"
                  align="center"
                  justify="center"
                >
                  <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                </v-row>
              </template>
              <v-card-actions>
                <v-spacer/>
                <v-btn
                  small dark color="primary" icon @click.native.stop="item.overlay=true">
                  <v-icon>mdi-information</v-icon>
                </v-btn>
              </v-card-actions>
            </v-img>
            <v-card-text v-else>
              <v-card flat color="transparent">
                <v-responsive :aspect-ratio="1">
                  <v-alert type="warning" border="left" class="mb-0">
                    게시물 읽기 권한이 없습니다
                  </v-alert>
                </v-responsive>
              </v-card>
            </v-card-text>
            <!-- <v-sheet :color="item.read ? 'secondary' : null"> -->
              <v-list-item class="text-truncate align-center hidden-xs-only">
                <v-list-item-content>
                  <v-list-item-subtitle class="text--primary">
                    <!-- <v-icon v-if="item.important === 1" small left color="success">mdi-bell-ring</v-icon>
                    <v-icon v-else-if="item.important === 2" small left color="warning">mdi-alert-circle</v-icon>
                    <v-icon v-if="newCheck(item.updatedAt, 'days', 1)" small color="error" left>mdi-fire</v-icon>
                    <span>{{item.title}}</span> -->
                    <display-title :item="item"/>
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <display-user :user="item.user" size="small" :uid="item.uid"></display-user>
                </v-list-item-action>
              </v-list-item>
            <!-- </v-sheet> -->
            <v-overlay
              absolute
              :opacity="0.7"
              :value="item.overlay"
              @click.native.stop="item.overlay = false"
            >
              <v-container fill-height fluid>
                <v-card color="transparent" flat tile>
                  <v-card-subtitle class="white--text">
                    <span>{{item.title}}</span>
                  </v-card-subtitle>
                </v-card>
              </v-container>
            </v-overlay>
          </v-card>
        </v-col>
      </template>
      <v-col cols="6" sm="4" md="3" lg="2" v-if="isMoreEnable">
        <v-card flat width="100%" height="100%" class="d-flex justify-center align-center">
          <v-btn
            @click="$emit('more')"
            v-intersect="onIntersect"
            color="primary"
            text
            x-large
            :loading="loading">
            <v-icon>mdi-dots-horizontal</v-icon>더보기
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import DisplayTitle from '@/components/display-title'
import DisplayTime from '@/components/display-time'
import DisplayUser from '@/components/display-user'
import DisplayCount from '@/components/display-count'
import addYoutubeIframe from '@/util/addYoutubeIframe'
import isGif from '@/util/isGif'
import newCheck from '@/util/newCheck'
import getImageUrlFromMd from '@/util/getImageUrlFromMd'
// const LIMIT = 5

export default {
  components: { DisplayTitle, DisplayTime, DisplayUser, DisplayCount },
  props: ['items', 'boardId', 'category', 'isWidget', 'isMoreEnable', 'loading'],
  data () {
    return {
      newCheck,
      vis: false
    }
  },
  computed: {
    fireUser () {
      return this.$store.state.fireUser
    },
    user () {
      return this.$store.state.user
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
    toPath (item) {
      const to = { path: `/board/${this.boardId}/${item.id}` }
      if (this.category) to.query = { category: this.category }
      return to
    },
    srcFromItem (item) {
      if (!item.images.length) return getImageUrlFromMd(item.summary)
      return isGif(item.images[0].id)
        ? item.images[0].url
        : item.images[0].thumbUrl
    },
    onIntersect (entries, observer, isIntersecting) {
      if (isIntersecting) this.$emit('more')
    }
  }
}
</script>
