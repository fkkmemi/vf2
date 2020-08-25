<template>
  <v-card flat>
    <template v-for="(item, i) in items">
      <v-divider :key="i" v-if="i > 0 && !replyDepth(item)"></v-divider>
      <v-list-item :key="item.id">
        <v-list-item-content>
          <v-list-item-subtitle v-if="!item.edit" class="black--text white-space text-left">
            <v-row>
              <v-col cols="12" :sm="item.image && item.image.url ? 6 : null" order="1" order-sm="0">
                <v-icon color="primary" v-for="i in replyDepth(item)" :key="i">mdi-subdirectory-arrow-right</v-icon>
                <v-icon color="error" left v-if="newCheck(item.updatedAt, 'days', 1)">mdi-fire</v-icon>
                <span v-text="item.comment"/>
              </v-col>
              <v-col cols="12" sm="6" order="0" order-sm="1" v-if="item.image">
                <v-img :src="item.image.url" contain max-width="400"></v-img>
              </v-col>
            </v-row>
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
            <span class="font-italic caption mr-4"><display-time :time="item.createdAt"></display-time></span>
            <display-user :user="item.user" size="small"></display-user>
          </v-list-item-subtitle>
          <v-list-item-title class="d-flex justify-end">
            <v-btn
              v-if="(fireUser && fireUser.uid === item.uid)"
              @click="item.edit=!item.edit"
              :color="item.edit ? 'warning' : 'primary'"
              text
            >
              <v-icon left>mdi-pencil</v-icon>
              수정
            </v-btn>
            <v-btn
              v-if="fireUser && !replyDepth(item)"
              @click="replyToggle(item)"
              :color="item.replyEdit ? 'warning' : 'primary'"
              text
            >
              <v-icon left>mdi-comment-multiple</v-icon>
              대댓글
            </v-btn>
            <v-btn
              v-if="fireUser && replyDepth(item) === 1"
              @click="replyToggle(item)"
              :color="item.replyEdit ? 'warning' : 'primary'"
              text
            >
              <v-icon left>mdi-comment-multiple</v-icon>
              언급
            </v-btn>
            <v-btn @click="like(item)" text>
              <v-icon left :color="liked(item) ? 'success': ''">mdi-thumb-up</v-icon>
              <span>{{item.likeCount}}</span>
            </v-btn>
            <v-btn color="error" icon @click="remove(item)" v-if="(fireUser && fireUser.uid === item.uid) || (user && user.level === 0)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-title>
          <v-list-item-subtitle v-if="item.replyEdit">
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="8">
                  <v-textarea
                    v-model="item.replyComment"
                    outlined
                    label="대댓글 작성"
                    placeholder="Ctrl + Enter로 작성 가능"
                    append-icon="mdi-comment-multiple"
                    @click:append="saveReply(item)"
                    @keypress.ctrl.enter="saveReply(item)"
                    hide-details
                    auto-grow
                    rows="5"
                    clearable
                    class="mt-2"/>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-tabs v-model="item.replyImage.tab">
                    <v-tab>
                      <v-icon left>mdi-laptop</v-icon> 내 컴퓨터
                    </v-tab>
                    <v-tab>
                      <v-icon left>mdi-link</v-icon> 링크
                    </v-tab>
                  </v-tabs>
                  <v-tabs-items v-model="item.replyImage.tab" class="mt-4">
                    <v-tab-item>
                      <v-file-input
                        v-model="item.replyImage.file"
                        outlined
                        hide-details
                        label="이미지 추가"
                        prepend-icon=""
                        prepend-inner-icon="mdi-file-image"
                        class="mb-4"
                        accept="image/*"
                        @change="imageReplyUpload(item.replyImage)"/>
                    </v-tab-item>
                    <v-tab-item>
                      <v-text-field
                        v-model="item.replyImage.imageLink"
                        outlined
                        hide-details
                        label="이미지 링크 추가"
                        class=""
                        prepend-inner-icon="mdi-image"/>
                    </v-tab-item>
                  </v-tabs-items>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions class="pt-0">
              <v-spacer/>
              <v-btn color="primary" text @click="saveReply(item)"><v-icon left>mdi-content-save</v-icon> 저장</v-btn>
            </v-card-actions>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <!-- <v-divider :key="i"></v-divider> -->
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
    <template v-else>
      <v-divider v-if="items.length"/>
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="8">
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
              rows="5"
              clearable />
          </v-col>
          <v-col cols="12" sm="4">
            <v-tabs v-model="tab">
              <v-tab>
                <v-icon left>mdi-laptop</v-icon> 내 컴퓨터
              </v-tab>
              <v-tab>
                <v-icon left>mdi-link</v-icon> 링크
              </v-tab>
            </v-tabs>
            <v-tabs-items v-model="tab" class="mt-4">
              <v-tab-item>
                <v-file-input
                  v-model="file"
                  outlined
                  hide-details
                  label="이미지 추가"
                  prepend-icon=""
                  prepend-inner-icon="mdi-file-image"
                  class="mb-4"
                  accept="image/*"
                  @change="imageUpload"/>
              </v-tab-item>
              <v-tab-item>
                <v-text-field
                  v-model="imageLink"
                  outlined
                  hide-details
                  label="이미지 링크 추가"
                  class=""
                  prepend-inner-icon="mdi-image"/>
              </v-tab-item>
            </v-tabs-items>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer/>
        <v-btn color="primary" text @click="save"><v-icon left>mdi-content-save</v-icon> 저장</v-btn>
      </v-card-actions>
    </template>
  </v-card>
</template>
<script>
import { last } from 'lodash'
import DisplayTime from '@/components/display-time'
import DisplayUser from '@/components/display-user'
import newCheck from '@/util/newCheck'

const LIMIT = 5

export default {
  components: { DisplayTime, DisplayUser },
  props: ['boardId', 'articleId', 'article', 'docRef'],
  data () {
    return {
      comment: '',
      items: [],
      unsubscribe: null,
      lastDoc: null,
      loading: false,
      newCheck,
      imageLink: '',
      image: {
        size: 0,
        id: '',
        url: ''
      },
      file: null,
      tab: null
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
          item.replyImage = {
            size: 0,
            id: '',
            url: '',
            file: null,
            imageLink: '',
            tab: null
          }
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

      const rs = this.items.filter(el => el.no % 10000 === 0)
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
        no: rs.length * 10000
      }
      if (this.imageLink) {
        doc.image = {
          id: '', size: 0, url: this.imageLink
        }
        this.imageLink = ''
      }
      if (this.image.id) doc.image = this.image
      const id = doc.createdAt.getTime().toString()
      await this.docRef.collection('comments').doc(id).set(doc)
      this.comment = ''
      this.image.id = ''
    },
    async saveReply (item) {
      if (!this.fireUser) throw Error('로그인이 필요합니다')
      if (this.article.commentCount > 100) throw Error('댓글 개수 허용치를 넘었습니다')
      if (!item.replyComment) throw Error('내용을 작성해야 합니다')
      if (item.replyComment.length > 300) throw Error('문자 허용치를 넘었습니다')
      const depth = this.replyDepth(item)
      if (depth > 1) throw Error('대대댓글은 허용하지 않습니다')
      let no = 0

      if (!depth) {
        const max = item.no + 10000
        const rs = this.items.filter(el => {
          return el.no > item.no && el.no < max && (el.no % 100 === 0)
        })
        if (rs.length) no = last(rs).no + 100
        else no = item.no + 100
      } else {
        const max = item.no + 100
        const rs = this.items.filter(el => {
          return el.no > item.no && el.no < max && (el.no % 100 > 0)
        })
        if (rs.length) no = last(rs).no + 1
        else no = item.no + 1
      }

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
      if (item.replyImage.imageLink) {
        doc.image = {
          id: '', size: 0, url: item.replyImage.imageLink
        }
      }
      if (item.replyImage.id) {
        doc.image = {
          id: item.replyImage.id, size: item.replyImage.size, url: item.replyImage.url
        }
      }
      const id = doc.createdAt.getTime().toString()
      try {
        await this.docRef.collection('comments').doc(id).set(doc)
      } finally {
        item.replyEdit = false
        item.replyComment = ''
        item.replyImage = {
          size: 0,
          id: '',
          url: '',
          file: null,
          imageLink: '',
          tab: null
        }
      }

      const findItem = this.items.find(el => id === el.id)
      if (findItem) return
      doc.id = id
      doc.edit = false
      doc.replyEdit = false
      doc.replyComment = ''
      doc.replyImage = {
        size: 0,
        id: '',
        url: '',
        file: null,
        imageLink: '',
        tab: null
      }
      this.items.push(doc)
      this.items.sort((before, after) => before.no - after.no)
    },
    replyDepth (item) {
      const r0 = item.no % 10000
      const r1 = item.no % 100
      let depth = 0
      if (r0) depth++
      if (r1) depth++
      return depth
    },
    replyToggle (item) {
      item.replyComment = `@${item.user.displayName} `
      item.replyEdit = !item.replyEdit
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
        comment: item.comment
      }
      try {
        await this.docRef.collection('comments').doc(item.id).update(doc)
      } finally {
        item.edit = false
      }
    },
    async imageUpload (file) {
      if (!this.user) throw Error('로그인이 필요합니다')
      const image = {
        size: file.size,
        id: new Date().getTime() + '-' + this.user.uid + '-' + file.name,
        url: ''
      }
      const sn = await this.$firebase.storage().ref()
        .child('images').child('boards')
        .child(this.boardId).child(this.articleId).child(image.id)
        .put(file)
      image.url = await sn.ref.getDownloadURL()
      this.image = image
    },
    async imageReplyUpload (item) {
      if (!this.user) throw Error('로그인이 필요합니다')
      const image = {
        size: item.file.size,
        id: new Date().getTime() + '-' + this.user.uid + '-' + item.file.name,
        url: ''
      }
      const sn = await this.$firebase.storage().ref()
        .child('images').child('boards')
        .child(this.boardId).child(this.articleId).child(image.id)
        .put(item.file)
      image.url = await sn.ref.getDownloadURL()

      item.size = image.size
      item.id = image.id
      item.url = image.url
    }
  }
}
</script>
