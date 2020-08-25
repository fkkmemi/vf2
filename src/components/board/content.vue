<template>
  <v-container v-if="!loaded" fluid>
    <v-skeleton-loader type="card"></v-skeleton-loader>
  </v-container>
  <v-container v-else-if="loaded && !board" fluid>
    <v-alert type="warning" border="left" class="mb-0">
      게시판이 없습니다
    </v-alert>
  </v-container>
  <v-container v-else fluid :class="$vuetify.breakpoint.xs ? 'pa-0' : ''">
    <v-card outlined :tile="$vuetify.breakpoint.xs">
      <v-toolbar color="transparent" dense flat>
        <v-sheet width="120" class="mr-4">
          <v-select
            :value="getCategory"
            :items="categories"
            @change="changeCategory"
            dense
            outlined
            single-line
            flat
            hide-details/>
        </v-sheet>
        <template v-if="!$vuetify.breakpoint.xs">
          <v-icon color="error" left v-if="newCheck(board.updatedAt, 'days', 1)">mdi-fire</v-icon>
          <span v-text="board.title" class="mr-2"></span>
        </template>
        <v-spacer/>
        <v-btn icon :to="'/board/' + board.id" v-if="isWidget"><v-icon>mdi-arrow-right-circle-outline</v-icon></v-btn>
        <v-btn icon @click="dialog=true"><v-icon>mdi-information-outline</v-icon></v-btn>
        <template v-if="!isWidget">
          <v-btn icon v-if="board.type === '일반'" @click="$store.commit('toggleBoardType')">
            <v-icon v-text="$store.state.boardTypeList ? 'mdi-format-list-bulleted' : 'mdi-text-box-outline'"></v-icon>
          </v-btn>
        </template>
        <template v-if="user">
          <v-btn icon @click="articleWrite" :disabled="!user"><v-icon>mdi-plus</v-icon></v-btn>
        </template>
      </v-toolbar>
      <v-divider/>
      <board-article
        :boardId="boardId"
        :board="board"
        :category="category"
        :createdAt="createdAt"
        :isWidget="isWidget"></board-article>
      <v-dialog v-model="dialog" max-width="400">
        <v-card>
          <v-toolbar color="transparent" dense flat>
            <v-toolbar-title>게시판 정보</v-toolbar-title>
            <v-spacer/>
            <v-btn icon @click="write" :disabled="user && user.level > 0"><v-icon>mdi-pencil</v-icon></v-btn>
            <v-btn icon @click="dialog=false"><v-icon>mdi-close</v-icon></v-btn>
          </v-toolbar>
          <v-divider/>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                게시판 유형
              </v-list-item-title>
              <v-list-item-subtitle>
                {{board.type}}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                게시판 이름
              </v-list-item-title>
              <v-list-item-subtitle>
                {{board.title}}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                작성자
              </v-list-item-title>
              <v-list-item-subtitle>
                <display-user :user="board.user"></display-user>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                작성일
              </v-list-item-title>
              <v-list-item-subtitle class="font-italic">
                <display-time :time="board.createdAt"></display-time>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                수정일
              </v-list-item-title>
              <v-list-item-subtitle class="font-italic">
                <display-time :time="board.updatedAt"></display-time>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                등록된 종류
              </v-list-item-title>
              <v-list-item-subtitle class="white-space">
                <v-chip
                  color="primary"
                  label
                  small
                  outlined
                  v-for="item in board.categories"
                  :key="item"
                  class="mt-2 mr-2">
                  <span class="caption mr-2">{{item}}</span>
                  <span class="caption" v-if="item === '전체'"> ({{board.count}})</span>
                  <span class="caption" v-else> ({{board.categoryCount[item]}})</span>
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                등록된 태그
              </v-list-item-title>
              <v-list-item-subtitle class="white-space">
                <v-chip color="info" label small outlined v-for="item in board.tags" :key="item" class="mt-2 mr-2" v-text="item"></v-chip>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>
                설명
              </v-list-item-title>
              <v-list-item-subtitle class="white-space" v-text="board.description"></v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider/>
          <v-card-actions>
            <v-spacer/>
            <v-btn text @click="dialog=false"><v-icon left>mdi-close</v-icon>닫기</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
  </v-container>
</template>
<script>
import BoardArticle from './article/index'
import DisplayTime from '@/components/display-time'
import DisplayUser from '@/components/display-user'
import newCheck from '@/util/newCheck'

export default {
  components: { BoardArticle, DisplayTime, DisplayUser },
  props: ['boardId', 'category', 'tag', 'createdAt', 'isWidget'],
  data () {
    return {
      unsubscribe: null,
      board: null,
      loading: false,
      dialog: false,
      newCheck,
      loaded: false,
      categories: []
    }
  },
  watch: {
    boardId () {
      this.cacheClear()
      this.subscribe()
    },
    category () {
      this.cacheClear()
    }
  },
  computed: {
    getCategory () {
      if (!this.category) return '전체'
      return this.category
    },
    user () {
      return this.$store.state.user
    }
  },
  created () {
    this.subscribe()
  },
  destroyed () {
    if (this.unsubscribe) this.unsubscribe()
  },
  methods: {
    cacheClear () {
      this.$store.commit('setCached', {
        boardId: this.boardId,
        lastDoc: null,
        items: []
      })
    },
    subscribe () {
      if (this.unsubscribe) this.unsubscribe()
      const ref = this.$firebase.firestore().collection('boards').doc(this.boardId)
      this.loaded = false
      this.unsubscribe = ref.onSnapshot(doc => {
        this.loaded = true
        if (!doc.exists) return this.write()
        const item = doc.data()
        item.id = doc.id
        item.createdAt = item.createdAt.toDate()
        item.updatedAt = item.updatedAt.toDate()
        item.categories.unshift('전체')
        this.categories = item.categories.map(v => {
          return { value: v, text: `${v} (${item.categoryCount[v]})` }
        })
        this.categories.unshift({ value: '전체', text: `전체 (${item.count})` })
        // .item.categories.unshift('전체')
        this.board = item
      }, console.error)
    },
    async write () {
      this.$router.push({ path: '/board/' + this.boardId, query: { action: 'write' } })
    },
    async articleWrite () {
      const to = {
        path: '/board/' + this.boardId + '/' + new Date().getTime(),
        query: { action: 'write' }
      }
      if (this.category) to.query.category = this.category
      this.$router.push(to)
    },
    changeCategory (item) {
      if (item === '전체') this.$router.push('/board/' + this.boardId)
      else this.$router.push({ path: '/board/' + this.boardId, query: { category: item } })
    }
  }
}
</script>
