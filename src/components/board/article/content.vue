<template>
  <v-container fluid :class="$vuetify.breakpoint.xs ? 'pa-0' : ''">
    <v-card v-if="article" outlined :tile="$vuetify.breakpoint.xs">
      <v-toolbar color="transparent" dense flat>
        <v-toolbar-title>
          <v-chip color="info" small label class="mr-4">{{article.category}}</v-chip>
          {{article.title}}
        </v-toolbar-title>
        <v-spacer/>
        <template v-if="(fireUser && fireUser.uid === article.uid) || (user && user.level === 0)">
          <v-btn @click="articleWrite" icon><v-icon>mdi-pencil</v-icon></v-btn>
          <v-btn @click="remove" icon><v-icon>mdi-delete</v-icon></v-btn>
        </template>
        <v-btn @click="back" icon><v-icon>mdi-close</v-icon></v-btn>
      </v-toolbar>
      <v-divider/>
      <v-card-text>
        <viewer v-if="content" :initialValue="content"></viewer>
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
        <v-sheet class="mr-4">
          <v-icon left :color="article.readCount ? 'info' : ''">mdi-eye</v-icon>
          <span class="body-2">{{article.readCount}}</span>
        </v-sheet>
        <v-sheet class="mr-0">
          <v-icon left :color="article.commentCount ? 'info' : ''">mdi-comment</v-icon>
          <span class="body-2">{{article.commentCount}}</span>
        </v-sheet>
        <v-btn text @click="like">
          <v-icon left :color="liked ? 'success' : ''">mdi-thumb-up</v-icon>
          <span class="body-2">{{article.likeCount}}</span>
        </v-btn>
      </v-card-actions>
      <v-card-actions>
        <v-chip small label outlined color="info" class="mr-2" v-for="tag in article.tags" :key="tag" v-text="tag"></v-chip>
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
    <v-card v-else>
      <v-container>
        <v-row justify="center" align="center">
          <v-progress-circular indeterminate></v-progress-circular>
        </v-row>
      </v-container>
    </v-card>
  </v-container>

</template>
<script>
import axios from 'axios'
import DisplayTime from '@/components/display-time'
import DisplayComment from '@/components/display-comment'
import DisplayUser from '@/components/display-user'

export default {
  components: { DisplayTime, DisplayComment, DisplayUser },
  props: ['boardId', 'articleId'],
  data () {
    return {
      content: '',
      ref: null,
      unsubscribe: null,
      article: null,
      doc: null
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
    articleId () {
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
      this.unsubscribe = this.ref.onSnapshot(doc => {
        if (!doc.exists) {
          this.back()
          return
        }
        this.doc = doc
        const item = doc.data()
        item.createdAt = item.createdAt.toDate()
        item.updatedAt = item.updatedAt.toDate()
        if (!this.article || this.article.url !== item.url) this.fetch(item.url)
        this.article = item
      }, console.error)
    },
    async fetch (url) {
      this.content = ''
      const r = await axios.get(url)
      this.content = typeof r.data === 'string' ? r.data : r.data.toString()
    },
    async articleWrite () {
      this.$router.push({ path: this.$route.path, query: { action: 'write' } })
    },
    async remove () {
      await this.ref.delete()
    },
    back () {
      const us = this.$route.path.split('/')
      us.pop()
      this.$router.push({ path: us.join('/') })
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
      const ref = this.$firebase.firestore()
        .collection('boards').doc(this.boardId)
        .collection('articles').orderBy('createdAt', 'desc')
      let sn
      if (arrow < 0) sn = await ref.endBefore(this.doc).limitToLast(1).get()
      else sn = await ref.startAfter(this.doc).limit(1).get()

      if (sn.empty) return this.$toast.info('더이상 페이지가 없습니다')
      const doc = sn.docs[0]

      const us = this.$route.path.split('/')
      us.pop()
      us.push(doc.id)
      this.$router.push({ path: us.join('/') })
    }
  }
}
</script>
