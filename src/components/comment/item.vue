<template>
  <v-hover v-slot:default="{ hover }" open-delay="300">
    <v-card
      :class="xs ? null : cardClass(hover)"
      :elevation="xs ? null : hover ? 16 : 0"
      :flat="xs"
      :tile="xs"
      :outlined="!xs"
      @click="$router.push(`/board/${item.boardId}/${item.articleId}`)">
      <v-card-subtitle class="text--primary body-1 d-flex align-center">
        <v-chip color="accent" outlined small class="mr-4">{{index}}</v-chip>
        <v-btn color="primary" depressed small :to="`/board/${item.boardId}`">
          {{item.boardId}}
          <v-icon right>mdi-menu-right</v-icon>
        </v-btn>
        <v-spacer/>
      </v-card-subtitle>
      <v-card-text class="text--primary white-space">
        {{ item.comment }}
      </v-card-text>
      <!-- <v-card-actions>
        <span class="font-italic caption"><display-time :time="item.createdAt" /></span>
        <v-spacer/>
        <display-user :user="item.user" size="small" />
      </v-card-actions> -->

      <v-card-actions>
        <span class="font-italic caption ml-2"><display-time :time="item.createdAt"></display-time></span>
        <v-spacer/>
        <display-user :user="item.user" :uid="item.uid"></display-user>
      </v-card-actions>
    </v-card>
  </v-hover>
</template>
<script>
import DisplayTime from '@/components/display-time'
import DisplayUser from '@/components/display-user'
import getSummary from '@/util/getSummary'
import addYoutubeIframe from '@/util/addYoutubeIframe'

export default {
  components: { DisplayTime, DisplayUser },
  props: ['item', 'index'],
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
      if (this.xs) return 'ma-0'
      return hover ? 'ma-0 pa-1' : 'ma-1'
    }
  }
}
</script>
