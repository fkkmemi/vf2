<template>
  <div>
    <template v-for="(item, i) in items">
      <v-card :key="item.id" :class="$vuetify.breakpoint.xs ? '' : 'ma-4'" :flat="$vuetify.breakpoint.xs">
        <v-card color="transparent" flat :to="category ? `${boardId}/${item.id}?category=${category}`:`${boardId}/${item.id}`">
          <v-card-subtitle class="text--primary body-1" :class="item.important > 0 ? 'text-truncate': ''">
            <display-title :item="item"/>
            <v-spacer/>
            <display-count v-if="item.important > 0" :item="item" :column="false"></display-count>
          </v-card-subtitle>
          <template v-if="!item.important">
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
              <v-btn
                v-if="fireUser && fireUser.uid === item.uid"
                :to="`${boardId}/${item.id}?action=write`"
                text color="primary">
                <v-icon left>mdi-pencil</v-icon>수정하기
              </v-btn>
            </v-card-actions>
          </template>
        </v-card>
        <template v-if="!item.important">
          <v-card-actions>
            <span class="font-italic caption"><display-time :time="item.createdAt"></display-time></span>
            <v-spacer/>
            <display-user :user="item.user"></display-user>
          </v-card-actions>
          <v-card-actions>
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
                :to="`${$route.path}?category=${item.category}`"
              >
                {{item.category}}
                <v-icon right>mdi-menu-right</v-icon>
              </v-btn>
              <v-chip small label outlined color="info" class="mr-2 mb-2" v-for="tag in item.tags" :key="tag" v-text="tag"></v-chip>
            </v-row>
          </v-card-text>
        </template>
      </v-card>
      <v-divider v-if="i < items.length - 1 && $vuetify.breakpoint.xs" :key="i"/>

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
