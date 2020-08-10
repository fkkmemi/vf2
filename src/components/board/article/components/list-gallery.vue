<template>
  <v-container fluid>
    <v-row dense>
      <template v-for="item in items">
        <v-col cols="6" sm="3" md="2" :key="item.id">
          <v-card
            color=""
            height="100%"
            @click="$router.push(toPath(item))">
            <v-img
              :src="srcFromItem(item)"
              :aspect-ratio="1"
              class="align-end"
            >
              <v-card-actions>
                <v-spacer/>
                <v-btn
                  small dark
                  color="primary"
                  @click.native.stop="like(item)"
                >
                  <v-icon left
                    :color="liked(item) ? 'success': ''"
                  >mdi-heart</v-icon>
                  <span>{{item.likeCount > 9 ? '9+' : item.likeCount}}</span>
                </v-btn>
                <v-btn
                  x-small fab dark color="primary" @click.native.stop="item.overlay=true">
                  <v-icon>mdi-information</v-icon>
                </v-btn>
              </v-card-actions>
            </v-img>
            <v-card-subtitle class="text-truncate align-center hidden-xs-only">
              <v-icon v-if="item.important === 1" small left color="success">mdi-bell-ring</v-icon>
              <v-icon v-else-if="item.important === 2" small left color="warning">mdi-alert-circle</v-icon>
              <v-icon v-if="newCheck(item.updatedAt, 'hours', 1)" small color="error" left>mdi-fire</v-icon>
              <span>{{item.title}}</span>
            </v-card-subtitle>
            <v-overlay
              absolute
              :opacity="0.7"
              :value="item.overlay"
            >
              <v-card color="transparent" flat tile class="" @click.native.stop="item.overlay = false">
                <v-card-text class="caption">
                  <span>{{item.title}} afwefwefwera wfwe wefwefwefwefwefwe</span>
                </v-card-text>
                <v-card-actions class="font-italic caption hidden-xs-only">
                  <v-spacer/>
                  <display-count :item="item" :column="false"></display-count>
                </v-card-actions>
                <v-card-actions class="font-italic caption hidden-xs-only">
                  <v-spacer/>
                  <span><display-time :time="item.createdAt"></display-time></span>
                </v-card-actions>
                <v-card-actions class="font-italic caption hidden-xs-only">
                  <v-spacer/>
                  <display-user :user="item.user"></display-user>
                </v-card-actions>

              </v-card>
            </v-overlay>
          </v-card>
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>
<script>
import DisplayTime from '@/components/display-time'
import DisplayUser from '@/components/display-user'
import DisplayCount from '@/components/display-count'
import addYoutubeIframe from '@/util/addYoutubeIframe'
import isGif from '@/util/isGif'
import newCheck from '@/util/newCheck'
import getImageUrlFromMd from '@/util/getImageUrlFromMd'
const LIMIT = 5

export default {
  components: { DisplayTime, DisplayUser, DisplayCount },
  props: ['items', 'boardId', 'category'],
  data () {
    return {
      newCheck,
      vis: false
    }
  },
  computed: {
    fireUser () {
      return this.$store.state.fireUser
    }
  },
  created () {
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
    },
    async like (item) {
      if (!this.fireUser) throw Error('로그인이 필요합니다')
      const ref = this.$firebase.firestore()
        .collection('boards').doc(this.boardId)
        .collection('articles').doc(item.id)
      if (this.liked(item)) {
        await ref.update({
          likeCount: this.$firebase.firestore.FieldValue.increment(-1),
          likeUids: this.$firebase.firestore.FieldValue.arrayRemove(this.fireUser.uid)
        })
      } else {
        await ref.update({
          likeCount: this.$firebase.firestore.FieldValue.increment(1),
          likeUids: this.$firebase.firestore.FieldValue.arrayUnion(this.fireUser.uid)
        })
      }
      if (this.items.findIndex(el => el.id === item.id) < LIMIT) return
      const doc = await ref.get()
      const d = doc.data()
      item.comment = d.comment
      item.likeCount = d.likeCount
      item.likeUids = d.likeUids
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
    }
  }
}
</script>
