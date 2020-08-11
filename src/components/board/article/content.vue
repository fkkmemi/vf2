<template>
  <v-container fluid v-if="!loaded">
    <v-skeleton-loader type="article"></v-skeleton-loader>
  </v-container>
  <v-container fluid v-else-if="loaded && !article">
    <v-alert type="warning" border="left" class="mb-0">
      게시물이 없습니다
    </v-alert>
  </v-container>
  <v-container v-else fluid :class="$vuetify.breakpoint.xs ? 'pa-0' : ''">
    <v-card outlined :tile="$vuetify.breakpoint.xs">
      <v-toolbar color="transparent" dense flat>
        <v-toolbar-title>
          <v-btn
            color="primary"
            depressed
            small
            class="mr-4"
            outlined
            @click="goCategory"
          >
            {{article.category}}
            <v-icon v-if="!category" right>mdi-menu-right</v-icon>
          </v-btn>
        </v-toolbar-title>
        <v-spacer/>
        <template v-if="(fireUser && fireUser.uid === article.uid) || (user && user.level === 0)">
          <v-spacer/>
          <v-btn @click="articleWrite" icon color="primary"><v-icon>mdi-pencil</v-icon></v-btn>
          <v-btn @click="remove" icon color="error"><v-icon>mdi-delete</v-icon></v-btn>
        </template>
        <v-btn @click="back" icon><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>
      <v-divider/>
      <v-card-subtitle class="text--primary body-1">
        <display-title :item="article"/>
      </v-card-subtitle>
      <v-card-text>
        <viewer v-if="content" :initialValue="content" @load="onViewerLoad" :options="tuiOptions"></viewer>
        <v-container v-else>
          <v-row justify="center" align="center">
            <v-progress-circular indeterminate></v-progress-circular>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <span class="font-italic caption">
          작성일: <display-time :time="article.createdAt"></display-time>
        </span>
      </v-card-actions>
      <v-card-actions>
        <v-spacer/>
        <span class="font-italic caption">
          수정일: <display-time :time="article.updatedAt"></display-time>
        </span>
      </v-card-actions>
      <v-card-actions>
        <v-spacer/>
        <span class="font-italic caption mr-4">
          작성자:
        </span>
        <display-user :user="article.user"></display-user>
      </v-card-actions>
      <v-card-actions>
        <v-spacer/>
        <display-count :item="article" :column="false"></display-count>
      </v-card-actions>
      <v-card-actions>
        <v-spacer/>
        <v-btn rounded @click="like" :color="liked ? 'success' : ''">
          <v-icon left>mdi-thumb-up-outline</v-icon>
          좋아요
          <!-- <span class="body-2">{{article.likeCount}}</span> -->
        </v-btn>
      </v-card-actions>
      <v-card-text>
        <v-row justify="start" align="center" class="px-4">
          <v-btn
            color="primary"
            depressed
            small
            outlined
            class="mr-4 mb-2"
            @click="goCategory"
          >
            {{article.category}}
            <v-icon right>mdi-menu-right</v-icon>
          </v-btn>
          <v-chip small label outlined color="info" class="mr-2 mb-2" v-for="tag in article.tags" :key="tag" v-text="tag"></v-chip>
        </v-row>
      </v-card-text>
      <v-card-actions v-if="(fireUser && fireUser.uid === article.uid) || (user && user.level === 0)">
        <v-spacer/>
        <v-btn @click="articleWrite" text color="primary"><v-icon left>mdi-pencil</v-icon>수정</v-btn>
        <v-btn @click="remove" text color="error"><v-icon left>mdi-delete</v-icon>삭제</v-btn>
      </v-card-actions>
      <v-divider/>
      <v-card-actions class="py-0">
        <v-row no-gutters>
          <v-col cols="4">
            <v-btn block text color="primary" @click="go(-1)"><v-icon left>mdi-menu-left</v-icon> 이전</v-btn>
          </v-col>
          <v-col cols="4" class="d-flex">
            <v-divider vertical></v-divider>
            <v-btn block text color="primary" @click="back"><v-icon left>mdi-format-list-bulleted-square</v-icon> 목록</v-btn>
            <v-divider vertical></v-divider>
          </v-col>
          <v-col cols="4">
            <v-btn block text color="primary" @click="go(1)"><v-icon left>mdi-menu-right</v-icon> 다음</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
      <v-divider/>
      <display-comment :article="article" :docRef="ref"></display-comment>
    </v-card>
  </v-container>
</template>
<script>
import axios from 'axios'
import DisplayTime from '@/components/display-time'
import DisplayComment from '@/components/display-comment'
import DisplayUser from '@/components/display-user'
import DisplayTitle from '@/components/display-title'
import DisplayCount from '@/components/display-count'
import addYoutubeIframe from '@/util/addYoutubeIframe'
import setMeta from '@/util/setMeta'
import getImageUrlFromMd from '@/util/getImageUrlFromMd'

export default {
  components: { DisplayTime, DisplayComment, DisplayUser, DisplayTitle, DisplayCount },
  props: ['boardId', 'articleId', 'action', 'category', 'tag'],
  data () {
    return {
      tuiOptions: {
        linkAttribute: {
          target: '_blank'
        }
      },
      content: '',
      ref: null,
      unsubscribe: null,
      article: null,
      doc: null,
      loaded: false
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    fireUser () {
      return this.$store.state.fireUser
    },
    liked () {
      if (!this.fireUser) return false
      return this.article.likeUids.includes(this.fireUser.uid)
    }
  },
  watch: {
    boardId () {
      this.subscribe()
    },
    articleId () {
      this.subscribe()
    },
    action () {
      this.subscribe()
    }
  },
  async created () {
    this.subscribe()
  },
  destroyed () {
    if (this.unsubscribe) this.unsubscribe()
  },
  methods: {
    subscribe () {
      window.scrollTo(0, 0)
      if (this.unsubscribe) this.unsubscribe()
      this.ref = this.$firebase.firestore().collection('boards').doc(this.boardId).collection('articles').doc(this.articleId)
      this.ref.update({
        readCount: this.$firebase.firestore.FieldValue.increment(1)
      })
      this.loaded = false
      this.unsubscribe = this.ref.onSnapshot(doc => {
        this.loaded = true
        if (!doc.exists) {
          this.back()
          return
        }
        this.doc = doc
        const item = doc.data()
        item.createdAt = item.createdAt.toDate()
        item.updatedAt = item.updatedAt.toDate()
        if (!this.article || this.article.url !== item.url) this.fetch(item)
        this.article = item
      }, console.error)
    },
    async fetch (item) {
      this.content = ''
      const r = await axios.get(item.url)
      this.content = typeof r.data === 'string' ? r.data : r.data.toString()

      let imgSrc = '/logo.png'
      if (this.article.images.length) imgSrc = this.article.images[0].thumbUrl
      else {
        const src = getImageUrlFromMd(this.content)
        if (src) imgSrc = src
      }
      setMeta({
        title: item.title,
        description: item.summary.substr(0, 80),
        image: imgSrc
      })
    },
    async articleWrite () {
      this.$router.push({ path: this.$route.path, query: { action: 'write' } })
    },
    async remove () {
      const r = await this.$swal.fire({
        title: '정말 삭제하시겠습니까?',
        text: '삭제 후 되돌릴 수 없습니다.',
        icon: 'error',
        // confirmButtonText: 'Cool',
        showCancelButton: true
      })
      if (!r.value) return
      await this.ref.delete()
    },
    back () {
      const us = this.$route.path.split('/')
      us.pop()
      if (this.category) this.$router.push({ path: us.join('/'), query: { category: this.category } })
      else this.$router.push({ path: us.join('/') })
    },
    async like () {
      if (!this.fireUser) throw Error('로그인이 필요합니다')
      if (this.liked) {
        await this.ref.update({
          likeCount: this.$firebase.firestore.FieldValue.increment(-1),
          likeUids: this.$firebase.firestore.FieldValue.arrayRemove(this.fireUser.uid)
        })
      } else {
        await this.ref.update({
          likeCount: this.$firebase.firestore.FieldValue.increment(1),
          likeUids: this.$firebase.firestore.FieldValue.arrayUnion(this.fireUser.uid)
        })
      }
    },
    async go (arrow) {
      if (!this.doc) return
      let ref
      if (!this.category) {
        ref = this.$firebase.firestore()
          .collection('boards').doc(this.boardId)
          .collection('articles')
          .orderBy('createdAt', 'desc')
      } else {
        ref = this.$firebase.firestore()
          .collection('boards').doc(this.boardId)
          .collection('articles')
          .where('category', '==', this.category)
          .orderBy('createdAt', 'desc')
      }
      let sn
      if (arrow < 0) sn = await ref.endBefore(this.doc).limitToLast(1).get()
      else sn = await ref.startAfter(this.doc).limit(1).get()

      if (sn.empty) throw Error('더이상 페이지가 없습니다')
      const doc = sn.docs[0]

      const us = this.$route.path.split('/')
      us.pop()
      us.push(doc.id)
      if (this.category) this.$router.push({ path: us.join('/'), query: { category: this.category } })
      else this.$router.push({ path: us.join('/') })
    },
    goCategory () {
      const us = this.$route.path.split('/')
      us.pop()
      this.$router.push({ path: us.join('/'), query: { category: this.article.category } })
    },
    onViewerLoad (v) {
      addYoutubeIframe(v.preview.el, this.$vuetify.breakpoint)
    }
  }
}
</script>
