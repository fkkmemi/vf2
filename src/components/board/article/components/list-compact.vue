<template>
  <div>
    <template v-for="(item, i) in items">
      <v-list-item three-line :key="item.id" :to="category ? `${boardId}/${item.id}?category=${category}`:`${boardId}/${item.id}`">
        <v-list-item-content>
          <v-list-item-subtitle class="d-flex align-center text--primary body-1">
            <v-btn
              v-if="!$vuetify.breakpoint.xs && category != item.category"
              color="primary"
              depressed
              small
              outlined
              class="mr-4"
              :to="`${$route.path}?category=${item.category}`"
            >
              {{item.category}}
              <v-icon right>mdi-menu-right</v-icon>
            </v-btn>
            <display-title :item="item"/>
            <v-spacer/>
          </v-list-item-subtitle>
          <v-list-item-subtitle class="d-flex justify-space-between align-center">
            <span class="font-italic caption"><display-time :time="item.createdAt"></display-time></span>
            <v-spacer/>
            <v-btn icon v-if="fireUser && fireUser.uid === item.uid" :to="`${boardId}/${item.id}?action=write`"><v-icon>mdi-pencil</v-icon></v-btn>
            <display-user :user="item.user" :size="'small'"></display-user>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <display-count :item="item" :column="true"></display-count>
        </v-list-item-action>
      </v-list-item>
      <v-divider v-if="i < items.length - 1" :key="i"/>
    </template>
  </div>
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
