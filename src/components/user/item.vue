<template>
  <v-container v-if="!loaded" fluid>
    <v-skeleton-loader type="article"/>
  </v-container>
  <v-container v-else-if="loaded && !item" fluid>
    <v-alert type="warning" border="left" class="mb-0">
      사용자 정보가 없습니다
    </v-alert>
  </v-container>
  <v-container v-else fluid :class="$vuetify.breakpoint.xs ? 'pa-0' : ''">
    <v-card outlined :tile="$vuetify.breakpoint.xs" :flat="$vuetify.breakpoint.xs">
      <v-toolbar color="transparent" dense flat>
        <v-toolbar-title>
          사용자 정보
        </v-toolbar-title>
        <v-spacer/>
        <v-btn @click="show=!show" icon>
          <v-icon v-text="show ? 'mdi-chevron-up' : 'mdi-chevron-down'"></v-icon>
        </v-btn>
      </v-toolbar>
      <template v-if="show">
        <v-divider/>
        <v-expand-transition>
          <v-list-item>
            <v-list-item-avatar>
              <v-img :src="item.photoURL"/>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ item.displayName }}
                <span v-if="!item.emailVerified">
                  <v-icon small right>mdi-alert</v-icon>
                  이메일 인증 안됨
                </span>
                <span class="caption">({{ levelStr }})</span>
              </v-list-item-title>
              <v-list-item-subtitle>
                <v-icon v-if="item.providerId === 'password'" small left color="primary">
                  mdi-email
                </v-icon>
                <v-icon v-if="item.providerId === 'google.com'" small left color="#dd4b39">
                  mdi-google
                </v-icon>
                <v-icon v-if="item.providerId === 'github.com'" small left color="#242a2e">
                  mdi-github
                </v-icon>
                <v-icon v-if="item.providerId === 'facebook.com'" small left color="#242a2e">
                  mdi-facebook
                </v-icon>
                {{hiddenEmail(item.email)}}
              </v-list-item-subtitle>
              <v-list-item-subtitle class="caption">
                가입일: <display-time :time="item.createdAt"/>
              </v-list-item-subtitle>
              <v-list-item-subtitle class="caption">
                수정일: <display-time :time="item.updatedAt"/>
              </v-list-item-subtitle>
              <v-list-item-subtitle class="caption">
                방문일: <display-time :time="item.visitedAt"/>
              </v-list-item-subtitle>
              <v-list-item-subtitle class="caption">
                방문횟수: {{item.visitCount}}
              </v-list-item-subtitle>
              <v-list-item-subtitle class="caption">
                게시물수: {{item.articleCount}}
              </v-list-item-subtitle>
              <v-list-item-subtitle class="caption">
                댓글수: {{item.commentCount}}
              </v-list-item-subtitle>
              <v-list-item-subtitle class="caption">
                좋아요수: {{item.likeCount}}
              </v-list-item-subtitle>
            </v-list-item-content>
            <!-- <v-list-item-action>
              <v-btn :to="`/user/${item.id}`" icon><v-icon>mdi-account-search</v-icon></v-btn>
            </v-list-item-action> -->
          </v-list-item>
        </v-expand-transition>
      </template>
    </v-card>
  </v-container>
</template>
<script>
import DisplayTime from '@/components/display-time'
import constants from '@/util/constants'
import hiddenEmail from '@/util/hiddenEmail'

export default {
  components: { DisplayTime },
  props: ['uid'],
  data () {
    return {
      loaded: false,
      show: true,
      item: null,
      hiddenEmail
    }
  },
  computed: {
    levelStr () {
      if (!this.item) return ''
      return constants.levels.find(v => v.value === this.item.level).text
    }
  },
  watch: {
    uid (n) {
      if (n) this.fetch()
    }
  },
  mounted () {
    this.fetch()
  },
  methods: {
    async fetch () {
      try {
        this.user = null
        this.loaded = false
        const doc = await this.$firebase.firestore().collection('users').doc(this.uid).get()
        const item = doc.data()
        item.createdAt = item.createdAt.toDate()
        item.updatedAt = item.updatedAt.toDate()
        item.visitedAt = item.visitedAt.toDate()
        this.item = item
      } finally {
        this.loaded = true
      }
    }
  }

}
</script>
