<template>
  <v-container v-if="!loaded" fluid>
    <v-skeleton-loader type="card"></v-skeleton-loader>
  </v-container>
  <v-container v-else-if="loaded && !board" fluid>
    <v-alert type="warning" border="left" class="mb-0">
      게시판이 없습니다
    </v-alert>
  </v-container>
  <v-container v-else-if="board.level < 6 && (user && user.level > board.level)" fluid>
    <v-alert type="warning" border="left" class="mb-0">
      게시판 읽기 권한이 없습니다
    </v-alert>
  </v-container>
  <v-container v-else fluid :class="xs ? 'pa-0' : ''">
    <v-row :no-gutters="xs">
      <v-col cols="12" :md="!xs && !isWidget ? 9 : null" :lg="!xs && !isWidget ? 10 : null">
        <v-card :outlined="!isWidget" :tile="xs">
          <v-toolbar color="transparent" dense flat>
            <v-sheet :width="120" class="mr-4">
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
            <template v-if="!xs">
              <v-icon color="error" left v-if="newCheck(board.updatedAt, 'days', 1)">mdi-fire</v-icon>
              <span v-text="board.title" class="mr-2 text-truncate"></span>
            </template>
            <v-spacer/>
            <v-btn icon :to="'/board/' + board.id" v-if="isWidget"><v-icon>mdi-arrow-right-circle-outline</v-icon></v-btn>
            <v-btn icon @click="dialog=true" v-if="!isWidget && $vuetify.breakpoint.smAndDown"><v-icon>mdi-information-outline</v-icon></v-btn>
            <template v-if="!isWidget">
              <v-btn icon v-if="board.type === '일반'" @click="$store.commit('toggleBoardType')">
                <v-icon v-text="$store.state.boardTypeList ? 'mdi-format-list-bulleted' : 'mdi-text-box-outline'"></v-icon>
              </v-btn>
            </template>
            <v-btn icon @click="articleWrite" :disabled="!user"><v-icon>mdi-plus</v-icon></v-btn>
          </v-toolbar>
          <v-divider/>
          <v-sheet :color="$vuetify.theme.dark ? 'black' : 'transparent'">
            <article-list
              :boardId="boardId"
              :board="board"
              :category="category"
              :createdAt="createdAt"
              :isWidget="isWidget"/>
          </v-sheet>
        </v-card>
      </v-col>
      <v-col cols="12" :md="xs ? null : 3" :lg="xs ? null : 2" v-if="!xs && !isWidget">
        <v-card outlined>
          <v-toolbar color="transparent" dense flat>
            <v-toolbar-title class="body-1">정보</v-toolbar-title>
            <v-spacer/>
            <v-btn icon @click="write" v-if="user && user.level < 2"><v-icon>mdi-pencil</v-icon></v-btn>
          </v-toolbar>
          <v-divider/>
          <board-info :board="board"/>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-toolbar color="transparent" dense flat>
          <v-toolbar-title class="body-1">정보</v-toolbar-title>
          <v-spacer/>
          <v-btn icon @click="write" v-if="user && user.level < 2"><v-icon small>mdi-pencil</v-icon></v-btn>
          <v-btn icon @click="dialog=false"><v-icon small>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-divider/>
        <board-info :board="board"/>
        <v-divider/>
        <v-card-actions>
          <v-spacer/>
          <v-btn text @click="dialog=false"><v-icon left>mdi-close</v-icon>닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>
<script>
import BoardInfo from './info'
import ArticleList from './list'
import newCheck from '@/util/newCheck'

export default {
  components: { BoardInfo, ArticleList },
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
    },
    xs () {
      return this.$vuetify.breakpoint.xs
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
        items: [],
        articleId: null
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
