<template>
  <v-list-item @click="$router.push(`/board/${item.boardId}/${item.id}?category=${item.category}`)" >
    <v-list-item-avatar v-if="!xs && !widget">
      <v-img :src="item.images && item.images.length ? item.images[0].thumbUrl : '/logo.png'"/>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-subtitle class="text--primary body-1 d-flex align-center">
        <v-chip v-if="!widget" color="accent" outlined small class="mr-4">{{index}}</v-chip>
        <v-chip
          v-if="!xs && !boardId"
          color="primary" label small
          exact class="mr-4"
          :to="`/board/${item.boardId}?category=${item.category}`">
          {{item.boardId}} > {{item.category}}
          <!-- <v-icon right>mdi-menu-right</v-icon> -->
        </v-chip>
        <display-title :item="item"/>
        <v-spacer/>
      </v-list-item-subtitle>
      <v-list-item-subtitle v-if="!widget" class="d-flex justify-space-between align-center">
        <span class="font-italic caption"><display-time :time="item.createdAt"></display-time></span>
        <v-spacer/>
        <display-user :user="item.user" :size="'small'" :uid="item.uid"></display-user>
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action v-if="!widget">
      <display-count :item="item" :column="true"></display-count>
    </v-list-item-action>
  </v-list-item>
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
  props: ['item', 'index', 'widget', 'boardId'],
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
    },
    xs () {
      return this.$vuetify.breakpoint.xs
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
