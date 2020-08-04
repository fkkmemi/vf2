<template>
  <v-card flat>
    <template v-if="items.length > 4">
      <v-card-title>
        <v-textarea
          v-model="comment"
          outlined
          label="댓글 작성"
          placeholder="Ctrl + Enter로 작성 가능"
          append-icon="mdi-comment-plus"
          @click:append="save"
          @keypress.ctrl.enter="save"
          hide-details
          auto-grow
          rows="1"
          clearable />
      </v-card-title>
      <v-divider/>
    </template>
    <template v-for="(item, i) in items">
      <v-list-item :key="item.id">
        <v-list-item-icon v-if="isReplay(item)" >
          <v-icon>mdi-subdirectory-arrow-right</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-subtitle v-if="!item.edit" class="black--text white-space">
            <v-icon color="error" left v-if="newCheck(item.updatedAt, 'minutes', 10)">mdi-fire</v-icon> {{item.comment}}
          </v-list-item-subtitle>
          <v-list-item-subtitle v-else>
            <v-textarea
              v-model="item.comment"
              outlined
              label="댓글 수정"
              placeholder="Ctrl + Enter로 작성 가능"
              append-icon="mdi-comment-edit"
              @click:append="update(item)"
              @keypress.ctrl.enter="update(item)"
              hide-details
              auto-grow
              rows="1"
              clearable
              class="mt-2"
            ></v-textarea>
          </v-list-item-subtitle>
          <v-list-item-subtitle class="d-flex justify-end align-center">
            <span class="font-italic mr-4"><display-time :time="item.createdAt"></display-time></span>
            <display-user :user="item.user" size="small"></display-user>
          </v-list-item-subtitle>
          <v-list-item-title class="d-flex justify-end">
            <v-btn
              icon
              @click="item.edit=!item.edit"
              :color="item.edit ? 'warning' : ''"
              v-if="(fireUser && fireUser.uid === item.uid)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              v-if="fireUser && !isReplay(item)"
              icon
              @click="item.replyEdit=!item.replyEdit"
              :color="item.replyEdit ? 'warning' : ''"
            >
              <v-icon>mdi-comment-multiple</v-icon>
            </v-btn>
            <v-btn color="error" icon @click="remove(item)" v-if="(fireUser && fireUser.uid === item.uid) || (user && user.level === 0)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
            <v-btn @click="like(item)" text>
              <v-icon left :color="liked(item) ? 'success': ''">mdi-thumb-up</v-icon>
              <span>{{item.likeCount}}</span>
            </v-btn>
          </v-list-item-title>
          <v-list-item-subtitle v-if="item.replyEdit">
            <v-textarea
              v-model="item.replyComment"
              @click:append="saveReply(item)"
              @keypress.ctrl.enter="saveReply(item)"
              outlined
              label="대댓글 작정"
              placeholder="Ctrl + Enter로 작성 가능"
              append-icon="mdi-comment-multiple"
              hide-details
              auto-grow
              rows="1"
              clearable
              class="mt-2"></v-textarea>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider :key="i"></v-divider>
    </template>
    <v-list-item v-if="lastDoc && items.length < article.commentCount">
      <v-btn
        @click="more"
        :loading="loading"
        v-intersect="onIntersect"
        text
        color="primary"
        block>
        <v-icon>mdi-dots-horizontal</v-icon>더보기
      </v-btn>
    </v-list-item>
    <!-- <v-divider/> -->
    <v-card-title>
      <v-textarea
        v-model="comment"
        outlined
        label="댓글 작성"
        placeholder="Ctrl + Enter로 작성 가능"
        append-icon="mdi-comment-plus"
        @click:append="save"
        @keypress.ctrl.enter="save"
        hide-details
        auto-grow
        rows="1"
        clearable />
    </v-card-title>
  </v-card>
</template>
<script>
import { last } from 'lodash'
import DisplayTime from '@/components/display-time'
import DisplayUser from '@/components/display-user'
import newCheck from '@/util/newCheck'
const LIMIT = 5
const REPLY_LIMIT = 1000

export default {
  components: { DisplayTime, DisplayUser },
  props: ['article', 'docRef'],
  data () {
    return {
      comment: '',
      items: [],
      unsubscribe: null,
      lastDoc: null,
      loading: false,
      newCheck
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    fireUser () {
      return this.$store.state.fireUser
    }
  },
  watch: {
    docRef () {
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
          item.edit = false
          item.replyEdit = false
          item.replyComment = ''
          this.items.push(item)
        } else {
          findItem.comment = item.comment
          findItem.likeCount = item.likeCount
          findItem.likeUids = item.likeUids
          findItem.updatedAt = item.updatedAt.toDate()
          findItem.no = item.no
        }
      })
      this.items.sort((before, after) => before.no - after.no)
    },
    subscribe () {
      if (this.unsubscribe) this.unsubscribe()
      this.items = []
      this.unsubscribe = this.docRef.collection('comments').orderBy('no', 'asc').limit(LIMIT).onSnapshot(sn => {
        if (sn.empty) {
          this.items = []
          return
        }
        this.snapshotToItems(sn)
      })
    },
    async more () {
      if (!this.lastDoc) throw Error('더이상 데이터가 없습니다')
      if (this.loading) return
      this.loading = true
      try {
        const sn = await this.docRef.collection('comments').orderBy('no', 'asc').startAfter(this.lastDoc).limit(LIMIT).get()
        this.snapshotToItems(sn)
      } finally {
        this.loading = false
      }
    },
    onIntersect (entries, observer, isIntersecting) {
      if (isIntersecting) this.more()
    },
    async save () {
      if (!this.fireUser) throw Error('로그인이 필요합니다')
      if (this.article.commentCount > 100) throw Error('댓글 개수 허용치를 넘었습니다')
      if (!this.comment) throw Error('내용을 작성해야 합니다')
      if (this.comment.length > 300) throw Error('문자 허용치를 넘었습니다')

      const doc = {
        createdAt: new Date(),
        updatedAt: new Date(),
        comment: this.comment,
        uid: this.fireUser.uid,
        user: {
          email: this.user.email,
          photoURL: this.user.photoURL,
          displayName: this.user.displayName
        },
        likeCount: 0,
        likeUids: [],
        no: this.article.commentCount * REPLY_LIMIT
      }
      const id = doc.createdAt.getTime().toString()
      await this.docRef.collection('comments').doc(id).set(doc)
      this.comment = ''
    },
    async saveReply (item) {
      if (!this.fireUser) throw Error('로그인이 필요합니다')
      if (this.article.commentCount > 100) throw Error('댓글 개수 허용치를 넘었습니다')
      if (!item.replyComment) throw Error('내용을 작성해야 합니다')
      if (item.replyComment.length > 300) throw Error('문자 허용치를 넘었습니다')
      const min = item.no
      const max = item.no + REPLY_LIMIT
      const rs = this.items.filter(el => {
        return el.no > min && el.no < max
      })
      let no = min + rs.length + 1
      if (rs.length) no = last(rs).no + 1

      const doc = {
        createdAt: new Date(),
        updatedAt: new Date(),
        comment: item.replyComment,
        uid: this.fireUser.uid,
        user: {
          email: this.user.email,
          photoURL: this.user.photoURL,
          displayName: this.user.displayName
        },
        likeCount: 0,
        likeUids: [],
        no: no
      }
      const id = doc.createdAt.getTime().toString()
      await this.docRef.collection('comments').doc(id).set(doc)
      item.replyComment = ''

      const findItem = this.items.find(el => id === el.id)
      if (findItem) return
      doc.id = id
      this.items.push(doc)
      this.items.sort((before, after) => {
        return before.no - after.no
      })
    },
    isReplay (item) {
      return item.no % REPLY_LIMIT
    },
    liked (item) {
      if (!this.fireUser) return false
      return item.likeUids.includes(this.fireUser.uid)
    },
    async like (comment) {
      if (!this.fireUser) throw Error('로그인이 필요합니다')
      if (this.liked(comment)) {
        await this.docRef.collection('comments').doc(comment.id).update({
          likeCount: this.$firebase.firestore.FieldValue.increment(-1),
          likeUids: this.$firebase.firestore.FieldValue.arrayRemove(this.fireUser.uid)
        })
      } else {
        await this.docRef.collection('comments').doc(comment.id).update({
          likeCount: this.$firebase.firestore.FieldValue.increment(1),
          likeUids: this.$firebase.firestore.FieldValue.arrayUnion(this.fireUser.uid)
        })
      }
      if (this.items.findIndex(el => el.id === comment.id) < LIMIT) return
      const doc = await this.docRef.collection('comments').doc(comment.id).get()
      const item = doc.data()
      comment.comment = item.comment
      comment.likeCount = item.likeCount
      comment.likeUids = item.likeUids
    },
    async remove (comment) {
      const r = await this.$swal.fire({
        title: '정말 삭제하시겠습니까?',
        text: '삭제 후 되돌릴 수 없습니다.',
        icon: 'error',
        // confirmButtonText: 'Cool',
        showCancelButton: true
      })
      if (!r.value) return
      await this.docRef.collection('comments').doc(comment.id).delete()
      const i = this.items.findIndex(el => el.id === comment.id)
      this.items.splice(i, 1)
    },
    async update (item) {
      const doc = {
        updatedAt: new Date(),
        comment: item.replyComment
      }
      try {
        await this.docRef.collection('comments').doc(item.id).update(doc)
      } finally {
        item.edit = false
        item.replyEdit = false
        item.replyComment = ''
      }
    }
  }
}
</script>
