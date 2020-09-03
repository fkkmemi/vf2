<template>
  <v-container v-if="!loaded" fluid>
    <v-row>
      <v-col cols="12" sm="6" md="4" lg="3" xl="2" v-for="i in 4" :key="i">
        <v-skeleton-loader type="card"></v-skeleton-loader>
      </v-col>
    </v-row>
  </v-container>
  <v-container fluid v-else-if="(loaded && !items.length) && (!user || (user && user.level > 0))">
    <v-alert type="warning" border="left" class="mb-0">
      게시판이 없습니다
    </v-alert>
  </v-container>
  <v-container v-else fluid :class="$vuetify.breakpoint.xs ? 'pa-0' : ''">
    <v-card outlined :tile="$vuetify.breakpoint.xs">
      <v-toolbar color="transparent" dense flat>
        <v-toolbar-title>게시판 목록</v-toolbar-title>
        <v-spacer/>
      </v-toolbar>
        <v-sheet :color="$vuetify.theme.dark ? 'black' : 'transparent'">
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="4" md="3" lg="2" xl="1" v-if="user && user.level === 0">
                <v-card height="100%">
                  <v-subheader>
                    새로운 게시판 추가
                  </v-subheader>
                  <v-divider/>
                  <v-card-text>
                    <v-text-field
                      v-model="boardId"
                      label="게시판 아이디"
                      placeholder="주소에 사용 될 문자입니다"
                      outlined
                      hide-details />
                  </v-card-text>
                  <v-card-actions v-if="boardId">
                    <v-btn
                      :to="`/board/${boardId}`"
                      x-large
                      color="primary"
                      text
                      block>
                      <v-icon left>mdi-plus</v-icon>
                      추가
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
              <v-col cols="12" sm="4" md="3" lg="2" xl="1" v-for="(item) in items" :key="item.id">
                <v-card height="100%">
                  <v-subheader>
                    <v-icon color="error" left v-if="newCheck(item.updatedAt, 'days', 1)">mdi-fire</v-icon>
                    {{item.id}}
                    <v-spacer/>
                    <template v-if="user && user.level === 0">
                      <v-btn
                        icon
                        :to="`/board/${item.id}?&action=write`">
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        @click="remove(item)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-subheader>
                  <v-divider/>
                  <board-info :board="item"/>
                </v-card>
              </v-col>
              <v-col cols="12" sm="4" md="3" lg="2" xl="1"
                v-if="lastDoc">
                <v-container fluid fill-height>
                  <v-btn
                    @click="more"
                    v-intersect="onIntersect"
                    text
                    color="primary"
                    block
                    :loading="loading">
                    <v-icon>mdi-dots-horizontal</v-icon>더보기
                  </v-btn>
                </v-container>
              </v-col>
            </v-row>
          </v-card-text>
      </v-sheet>
    </v-card>
  </v-container>
</template>
<script>
import { last } from 'lodash'
import BoardInfo from '@/components/board/info'
import newCheck from '@/util/newCheck'
import setMeta from '@/util/setMeta'

const LIMIT = 5

export default {
  components: { BoardInfo },
  data () {
    return {
      unsubscribe: null,
      items: [],
      ref: null,
      lastDoc: null,
      order: 'createdAt',
      sort: 'desc',
      boardId: '',
      loading: false,
      newCheck,
      loaded: false
    }
  },
  computed: {
    user () { return this.$store.state.user }
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
          findItem.category = item.category
          findItem.title = item.title
          findItem.count = item.count
          findItem.description = item.description
          findItem.categories = item.categories
          findItem.tags = item.tags
          findItem.updatedAt = item.updatedAt.toDate()
        }
      })
      this.items.sort((before, after) => {
        return Number(after.createdAt.getTime()) - Number(before.createdAt.getTime())
      })
    },
    subscribe () {
      if (this.unsubscribe) this.unsubscribe()
      setMeta({
        title: '게시판 전체 목록',
        description: '게시판 전체 목록입니다',
        image: '/logo.png'
      })
      this.ref = this.$firebase.firestore()
        .collection('boards')
        .orderBy(this.order, this.sort).limit(LIMIT)
      this.loaded = false
      this.unsubscribe = this.ref.onSnapshot(sn => {
        this.loaded = true
        if (sn.empty) {
          this.items = []
          return
        }
        this.snapshotToItems(sn)
      }, console.error)
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
    async remove (item) {
      const r = await this.$swal.fire({
        title: '정말 삭제하시겠습니까?',
        text: '삭제 후 되돌릴 수 없습니다.',
        icon: 'error',
        // confirmButtonText: 'Cool',
        showCancelButton: true
      })
      if (!r.value) return
      await this.$firebase.firestore()
        .collection('boards').doc(item.id).delete()
      const i = this.items.findIndex(el => el.id === item.id)
      this.items.splice(i, 1)
    }
  }
}
</script>
