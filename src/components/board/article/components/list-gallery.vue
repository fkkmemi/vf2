<template>
  <v-container fluid>
    <v-row dense>
      <template v-for="item in items">
        <v-col cols="6" sm="3" md="2" :key="item.id">
          <v-card color="" height="100%" :to="toPath(item)">
            <v-img
              :src="isGif(item.images[0].id) ? item.images[0].url : item.images[0].thumbUrl"
              :aspect-ratio="1"
              class="align-end"
            >

              <v-card-actions class="mt-auto">
                <v-spacer/>
                <v-btn
                  small dark
                  color="primary"
                  @click.native.stop="like(item)"
                ><v-icon left
                :color="liked(item) ? 'success': ''"
                >mdi-heart</v-icon>
                  <span>{{item.likeCount > 9 ? '9+' : item.likeCount}}</span>
                </v-btn>
              </v-card-actions>
            </v-img>
            <v-card-subtitle class="text-truncate align-center">
              <v-icon small color="error" left v-if="newCheck(item.updatedAt, 'hours', 1)">mdi-fire</v-icon>
              <span>{{item.title}}</span>
            </v-card-subtitle>
          </v-card>
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>
<script>
import addYoutubeIframe from '@/util/addYoutubeIframe'
import isGif from '@/util/isGif'
import newCheck from '@/util/newCheck'

export default {
  props: ['items', 'boardId', 'category'],
  data () {
    return {
      isGif,
      newCheck
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
    },
    async like (item) {
      if (!this.fireUser) throw Error('로그인이 필요합니다')
      const ref = this.$firebase.firestore().collection('boards').doc(this.boardId).collection('articles').doc(item.id)
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
    },
    toPath (item) {
      const to = { path: `/board/${this.boardId}/${item.id}` }
      if (this.category) to.query = { category: this.category }
      return to
    }
  }
}
</script>
