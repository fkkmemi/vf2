<template>
  <v-hover v-slot:default="{ hover }" open-delay="300">
    <v-card
      :class="$vuetify.breakpoint.xs ? null : cardClass(hover)"
      :elevation="$vuetify.breakpoint.xs ? null : hover ? 16 : 0"
      :flat="$vuetify.breakpoint.xs"
      :tile="$vuetify.breakpoint.xs"
      :outlined="!$vuetify.breakpoint.xs"
      @click="$router.push(`/board/${item.boardId}/${item.id}?category=${item.category}`)">

      <v-card-subtitle class="text--primary body-1">
        <display-title :item="item"/>
        <v-spacer/>
      </v-card-subtitle>
      <v-card-text>
        <viewer :class="$vuetify.theme.dark ? 'tui-dark' : null" v-if="item.summary" :initialValue="item.summary" @load="onViewerLoad" :options="tuiOptions"></viewer>
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
      </v-card-actions>

      <v-card-actions>
        <span class="font-italic caption ml-2"><display-time :time="item.createdAt"></display-time></span>
        <v-spacer/>
      </v-card-actions>
      <v-card-actions>
        <display-user :user="item.user" :uid="item.uid"></display-user>
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
            class="mr-4 mb-2 text-none"
            :to="`/board/${item.boardId}?category=${item.category}`"
          >
            {{item.boardId}} > {{item.category}}
            <v-icon right>mdi-menu-right</v-icon>
          </v-btn>
          <v-chip small label outlined color="info" class="mr-2 mb-2" v-for="tag in item.tags" :key="tag" v-text="tag"></v-chip>
        </v-row>
      </v-card-text>
    </v-card>
  </v-hover>
</template>
<script>
import DisplayTitle from '@/components/display-title'
import DisplayTime from '@/components/display-time'
import DisplayUser from '@/components/display-user'
import DisplayCount from '@/components/display-count'
import getSummary from '@/util/getSummary'
import addYoutubeIframe from '@/util/addYoutubeIframe'

export default {
  components: { DisplayTitle, DisplayTime, DisplayUser, DisplayCount },
  props: ['item', 'index', 'boardId'],
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
  methods: {
    liked (item) {
      if (!this.fireUser) return false
      return item.likeUids.includes(this.fireUser.uid)
    },
    onViewerLoad (v) {
      addYoutubeIframe(v.preview.el, this.$vuetify.breakpoint)
    },
    cardClass (hover) {
      if (this.$vuetify.breakpoint.xs) return 'ma-0'
      return hover ? 'ma-0 pa-1' : 'ma-1'
    }
  }
}
</script>
