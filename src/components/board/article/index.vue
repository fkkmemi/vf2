<template>
  <v-container fluid v-if="!loaded">
    <v-skeleton-loader type="article" v-for="i in 3" :key="i"></v-skeleton-loader>
  </v-container>
  <v-container fluid v-else-if="loaded && !items.length">
    <v-alert type="warning" border="left" class="mb-0">
      게시물이 없습니다 <v-icon>mdi-plus</v-icon> 버튼을 눌러서 게시물을 작성하세요~
    </v-alert>
  </v-container>
  <v-container fluid v-else class="pa-0">
    <template v-for="(item, i) in items">
      <template v-if="$store.state.boardTypeList">
        <v-list-item three-line :key="item.id" :to="category ? `${boardId}/${item.id}?category=${category}`:`${boardId}/${item.id}`">
          <v-list-item-content>
            <v-list-item-title class="d-flex align-center">
              <v-btn
                v-if="!$vuetify.breakpoint.xs && category != item.category"
                color="info"
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
            </v-list-item-title>
            <v-list-item-subtitle class="d-flex justify-space-between align-center">
              <span class="font-italic caption"><display-time :time="item.createdAt"></display-time></span>
              <v-spacer/>
              <v-btn icon v-if="fireUser && fireUser.uid === item.uid" :to="`${boardId}/${item.id}?action=write`"><v-icon>mdi-pencil</v-icon></v-btn>
              <display-user :user="item.user" :size="'small'"></display-user>
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <div class="d-flex flex-column justify-space-between" style="width:50px">
              <div class="d-flex justify-space-between align-center">
                <v-icon left :color="item.readCount ? 'info' : ''">mdi-eye</v-icon>
                <span class="body-2">{{item.readCount}}</span>
              </div>
              <div class="d-flex justify-space-between align-center">
                <v-icon left :color="item.commentCount ? 'info' : ''">mdi-comment</v-icon>
                <span class="body-2">{{item.commentCount}}</span>
              </div>
              <div class="d-flex justify-space-between align-center">
                <v-icon left :color="liked(item) ? 'success' : ''">mdi-thumb-up</v-icon>
                <span class="body-2">{{item.likeCount}}</span>
              </div>
            </div>
          </v-list-item-action>
        </v-list-item>
        <v-divider v-if="i < items.length - 1" :key="i"/>
      </template>
      <template v-else>
        <v-card :key="item.id" :class="$vuetify.breakpoint.xs ? '' : 'ma-4'" :flat="$vuetify.breakpoint.xs">
          <v-subheader v-if="category != item.category">
            <v-btn
              color="info"
              depressed
              small
              outlined
              class="mr-4"
              :to="`${$route.path}?category=${item.category}`"
            >
              {{item.category}}
              <v-icon right>mdi-menu-right</v-icon>
            </v-btn>
          </v-subheader>

          <v-card color="transparent" flat :to="category ? `${boardId}/${item.id}?category=${category}`:`${boardId}/${item.id}`">
            <v-card-title>

              <display-title :item="item"/>
              <v-spacer/>
              <v-btn icon v-if="fireUser && fireUser.uid === item.uid" :to="`${boardId}/${item.id}?action=write`"><v-icon>mdi-pencil</v-icon></v-btn>
            </v-card-title>
            <v-card-text>
              <viewer v-if="item.summary" :initialValue="item.summary" @load="onViewerLoad" :options="tuiOptions"></viewer>
              <v-container v-else>
                <v-row justify="center" align="center">
                  <v-progress-circular indeterminate></v-progress-circular>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions class="d-flex justify-center">
              <v-btn text color="primary"><v-icon left>mdi-dots-horizontal</v-icon>더보기</v-btn>
            </v-card-actions>
          </v-card>
          <v-card-actions>
            <span class="font-italic caption"><display-time :time="item.createdAt"></display-time></span>
            <v-spacer/>
            <display-user :user="item.user"></display-user>
          </v-card-actions>
          <v-card-actions>
            <v-spacer/>
            <v-sheet class="mr-4">
              <v-icon left :color="item.readCount ? 'info' : ''">mdi-eye</v-icon>
              <span class="body-2">{{item.readCount}}</span>
            </v-sheet>
            <v-sheet class="mr-4">
              <v-icon left :color="item.commentCount ? 'info' : ''">mdi-comment</v-icon>
              <span class="body-2">{{item.commentCount}}</span>
            </v-sheet>
            <v-sheet class="mr-0">
              <v-icon left :color="liked(item) ? 'success' : ''">mdi-thumb-up</v-icon>
              <span class="body-2">{{item.likeCount}}</span>
            </v-sheet>
          </v-card-actions>
          <v-card-text class="mb-0">
            <v-row justify="end">
              <v-chip small label outlined color="info" class="mr-2 mb-2" v-for="tag in item.tags" :key="tag" v-text="tag"></v-chip>
            </v-row>
          </v-card-text>
        </v-card>
        <v-divider v-if="i < items.length - 1 && $vuetify.breakpoint.xs" :key="i"/>
      </template>
    </template>
    <v-list-item v-if="lastDoc && items.length < board.count">
      <v-btn
        @click="more"
        v-intersect="onIntersect"
        text
        color="primary"
        block
        :loading="loading">
        <v-icon>mdi-dots-horizontal</v-icon>더보기
      </v-btn>
    </v-list-item>
  </v-container>
</template>
<script>
import { last } from 'lodash'
import DisplayTime from '@/components/display-time'
import DisplayUser from '@/components/display-user'
import getSummary from '@/util/getSummary'
import newCheck from '@/util/newCheck'
import addYoutubeIframe from '@/util/addYoutubeIframe'
import DisplayTitle from '@/components/display-title'

const LIMIT = 5

export default {
  components: { DisplayTime, DisplayUser, DisplayTitle },
  props: ['board', 'boardId', 'category', 'tag'],
  data () {
    return {
      tuiOptions: {
        linkAttribute: {
          target: '_blank'
        }
      },
      items: [],
      unsubscribe: null,
      ref: null,
      lastDoc: null,
      order: 'createdAt',
      sort: 'desc',
      loading: false,
      getSummary,
      newCheck,
      loaded: false
    }
  },
  computed: {
    fireUser () {
      return this.$store.state.fireUser
    }
  },
  watch: {
    boardId () {
      this.subscribe()
    },
    category () {
      this.subscribe()
    }
  },
  created () {
    this.subscribe()
  },
  destroyed () {
    if (this.unsubscribe) this.unsubscribe()
  },
  methods: {
    snapshotToItems (sn) {
      this.lastDoc = last(sn.docs)
      sn.docs.forEach(doc => {
        const findItem = this.items.find(item => doc.id === item.id)
        const item = doc.data()
        if (!findItem) {
          item.id = doc.id
          item.createdAt = item.createdAt.toDate()
          item.updatedAt = item.updatedAt.toDate()
          this.items.push(item)
        } else {
          if (findItem.summary !== item.summary) {
            findItem.summary = ''
            setTimeout(() => {
              findItem.summary = item.summary
            }, 1000)
          }
          findItem.title = item.title
          findItem.readCount = item.readCount
          findItem.commentCount = item.commentCount
          findItem.likeCount = item.likeCount
          findItem.likeUids = item.likeUids
          findItem.categories = item.categories
          findItem.tags = item.tags
          findItem.updatedAt = item.updatedAt.toDate()
          findItem.important = item.important
        }
      })
      this.items.sort((before, after) => {
        if (after.important > before.important) return 1
        else if (after.important < before.important) return -1
        return Number(after.id) - Number(before.id)
      })
      console.log('sorted')
    },
    subscribe (arrow) {
      if (this.unsubscribe) this.unsubscribe()
      this.items = []
      if (!this.category) {
        this.ref = this.$firebase.firestore()
          .collection('boards').doc(this.boardId)
          .collection('articles')
          .orderBy('important', 'desc')
          .orderBy(this.order, this.sort)
          .limit(LIMIT)
      } else {
        this.ref = this.$firebase.firestore()
          .collection('boards').doc(this.boardId)
          .collection('articles')
          .where('category', '==', this.category)
          .orderBy('important', 'desc')
          .orderBy(this.order, this.sort)
          .limit(LIMIT)
      }
      this.loaded = false
      this.unsubscribe = this.ref.onSnapshot(sn => {
        this.loaded = true
        if (sn.empty) {
          this.items = []
          return
        }
        this.snapshotToItems(sn)
        console.log('here')
      })
    },
    read (item) {
      this.$router.push({ path: this.$route.path + '/' + item.id })
    },
    async more () {
      if (!this.lastDoc) throw Error('더이상 데이터가 없습니다')
      if (this.loading) return
      this.loading = true
      try {
        const sn = await this.ref.startAfter(this.lastDoc).get()
        this.snapshotToItems(sn)
      } finally {
        this.loading = false
      }
    },
    onIntersect (entries, observer, isIntersecting) {
      if (isIntersecting) this.more()
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
