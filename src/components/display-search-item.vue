<template>
  <v-card outlined class="mb-4" :to="`/board/${item.boardId}/${item.articleId}`">
    <v-card-subtitle class="text--primary body-1 text-truncate">
      <display-title :item="item"/>
      <v-spacer/>
    </v-card-subtitle>
    <v-card-text>
      <viewer v-if="item.content" :initialValue="item.content" @load="onViewerLoad" :options="tuiOptions"></viewer>
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
      <span class="font-italic caption"><display-time :time="new Date(item.createdAt)" /></span>
      <v-spacer/>
      <display-user :user="{email: item.email, displayName: item.displayName }" size="small" />
    </v-card-actions>
    <v-card-text>
      <v-row justify="start" align="center" class="px-4">
        <v-btn
          color="primary"
          depressed
          small
          outlined
          class="mr-4 mb-2"
          :to="`/board/${item.boardId}?category=${item.category}`"
        >
          {{item.category}}
          <v-icon right>mdi-menu-right</v-icon>
        </v-btn>
        <v-chip small label outlined color="info" class="mr-2 mb-2" v-for="tag in item.tags" :key="tag" v-text="tag"></v-chip>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
import DisplayTitle from '@/components/display-title'
import DisplayTime from '@/components/display-time'
import DisplayUser from '@/components/display-user'
import getSummary from '@/util/getSummary'
import addYoutubeIframe from '@/util/addYoutubeIframe'

export default {
  components: { DisplayTitle, DisplayTime, DisplayUser },
  props: ['item'],
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
    read (item) {
      this.$router.push({ path: this.$route.path + '/' + item.id })
    },
    liked (item) {
      if (!this.fireUser) return false
      return item.likeUids.includes(this.fireUser.uid)
    },
    onViewerLoad (v) {
      addYoutubeIframe(v.preview.el, this.$vuetify.breakpoint)
    }
  }
}
</script>
