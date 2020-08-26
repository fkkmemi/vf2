<template>
  <v-row :no-gutters="$vuetify.breakpoint.xs">
    <template v-for="(item, i) in items">
      <v-col cols="12" sm="6" md="4" lg="3" :key="item.id">
        <v-hover v-slot:default="{ hover }" open-delay="300">
          <v-card
            :class="cardClass(hover)"
            :flat="$vuetify.breakpoint.xs"
            :tile="$vuetify.breakpoint.xs"
            :elevation="hover ? 16 : 2"
            color="" @click="goTo(item)" :ref="item.id">
            <v-card-subtitle class="text--primary body-1">
              <display-title :item="item"/>
              <v-spacer/>
            </v-card-subtitle>
            <v-card-text>
              <viewer v-if="item.summary" :initialValue="item.summary" @load="onViewerLoad" :options="tuiOptions"></viewer>
              <v-container v-else>
                <v-row justify="center" align="center">
                  <v-progress-circular indeterminate></v-progress-circular>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions class="d-flex justify-center">
              <v-btn text color="primary">
                <v-icon left>mdi-dots-horizontal</v-icon>자세히 보기
              </v-btn>
              <!-- <v-btn
                v-if="fireUser && fireUser.uid === item.uid"
                :to="`/board/${boardId}/${item.id}?action=write`"
                text color="primary">
                <v-icon left>mdi-pencil</v-icon>수정하기
              </v-btn> -->
            </v-card-actions>
            <v-card-actions>
              <span class="font-italic caption ml-2"><display-time :time="item.createdAt"></display-time></span>
              <v-spacer/>
            </v-card-actions>
            <v-card-actions>
              <display-user :user="item.user"></display-user>
              <v-spacer/>
              <display-count :item="item" :column="false"></display-count>
            </v-card-actions>
            <v-card-text>
              <v-row justify="start" align="center" class="px-4">
                <v-btn
                  color="primary"
                  depressed
                  small
                  outlined
                  class="mr-4 mb-2"
                  @click.native.stop="category === item.category ? null : goCategory(item)"
                >
                  {{item.category}}
                  <v-icon right>mdi-menu-right</v-icon>
                </v-btn>
                <v-chip small label outlined color="info" class="mr-2 mb-2" v-for="tag in item.tags" :key="tag" v-text="tag"></v-chip>
              </v-row>
            </v-card-text>
          </v-card>
        </v-hover>
      </v-col>
      <v-divider v-if="i < items.length - 1 && $vuetify.breakpoint.xs" :key="i" inset/>
    </template>
  </v-row>
</template>
<script>
import DisplayTime from '@/components/display-time'
import DisplayUser from '@/components/display-user'
import DisplayTitle from '@/components/display-title'
import DisplayCount from '@/components/display-count'
import getSummary from '@/util/getSummary'
import addYoutubeIframe from '@/util/addYoutubeIframe'

export default {
  components: { DisplayTime, DisplayUser, DisplayTitle, DisplayCount },
  props: ['items', 'boardId', 'category'],
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
      addYoutubeIframe(v.preview.el, { xs: true })
    },
    cardClass (hover) {
      if (this.$vuetify.breakpoint.xs) return 'ma-0'
      return hover ? 'ma-0 pa-1' : 'ma-1'
    },
    goCategory (item) {
      this.$router.push(`/board/${this.boardId}?category=${item.category}`)
    }
  }
}
</script>
