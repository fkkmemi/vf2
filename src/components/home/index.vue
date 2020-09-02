<template>
  <v-container fluid v-if="!loaded">
    <v-skeleton-loader type="article"></v-skeleton-loader>
  </v-container>
  <v-container fluid v-else-if="loaded && !items.length">
    <v-alert v-if="!empty" type="warning" border="left" class="mb-0">
      표시할 내용이 없습니다
    </v-alert>
  </v-container>
  <v-container fluid v-else>
    <v-row>
      <v-col cols="12" sm="4" :order="$vuetify.breakpoint.xs ? 1 : null">
        <card-count :total="total" :values="sitemapValue.counts" :items="sitemaps"/>
      </v-col>
      <v-col cols="12" sm="4" :order="$vuetify.breakpoint.xs ? 2 : null">
        <card-read-count :total="total" :values="sitemapValue.readCounts" :items="sitemaps"/>
      </v-col>
      <v-col cols="12" sm="4" :order="$vuetify.breakpoint.xs ? 3 : null">
        <card-total :item="total"/>
      </v-col>
      <v-col cols="12" v-if="editable">
        <v-container fluid>
          <v-form>
            <v-card>
              <v-subheader>카드 추가
                <v-spacer/>
                <v-btn text @click="add" color="primary"><v-icon left>mdi-plus</v-icon>추가하기</v-btn>

              </v-subheader>
              <v-card-text>
                <v-row>
                  <v-col cols="6">
                    <v-select
                      :items="types"
                      v-model="form.type"
                      outlined
                      hide-details
                      label="유형" />
                  </v-col>
                  <v-col cols="6" v-if="form.type !== '유튜브'">
                    <v-select
                      :items="boardIds"
                      v-model="form.id"
                      outlined
                      hide-details
                      label="게시판" />
                  </v-col>
                  <v-col cols="6" v-else>
                    <v-text-field
                      v-model="form.id"
                      outlined
                      hide-details
                      label="유튜브아이디"
                      placeholder="ABCDEFGEAF" />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-form>
        </v-container>
      </v-col>
      <template v-for="(item, i) in cards">
        <v-col :key="i" cols="12" :sm="item.type === '갤러리' ? null : 6">
          <v-container fluid v-if="editable">
            <v-card dense>
              <v-toolbar flat>
                <v-toolbar-title>
                  <v-select
                    v-if="item.type !== '유튜브'"
                    :items="boardIds"
                    v-model="item.id"
                    outlined
                    hide-details
                    clearable
                    dense
                    label="" />
                  <v-text-field
                    v-else
                    v-model="item.id"
                    outlined
                    hide-details
                    label=""
                    dense
                    placeholder="ABCDEFGEAF" />
                </v-toolbar-title>
                <v-spacer/>
                <v-btn icon @click="save"><v-icon>mdi-content-save</v-icon></v-btn>
                <v-btn icon @click="remove(i)"><v-icon>mdi-delete</v-icon></v-btn>
              </v-toolbar>
            </v-card>
          </v-container>
          <card-youtube :id="item.id" v-if="item.type === '유튜브'"></card-youtube>
          <template v-else-if="item.type === '게시판'">
            <board-content v-if="item.id" :boardId="item.id" :isWidget="true" />
            <articles v-else :widget="true" />
          </template>
          <board-content v-else-if="item.type === '갤러리'" :boardId="item.id" :isWidget="true" />
          <v-card v-else>
            error
          </v-card>
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>
<script>
import setMeta from '@/util/setMeta'
import BoardContent from '@/components/board/content'
import CardYoutube from '@/components/card-youtube'
import Articles from '@/components/article'
import CardCount from './card-count'
import CardReadCount from './card-read-count'
import CardTotal from './card-total'

const LIMIT = 10

export default {
  components: { BoardContent, Articles, CardYoutube, CardCount, CardReadCount, CardTotal },
  // components: { CardCount, CardReadCount, CardTotal },
  data () {
    return {
      empty: false,
      loaded: false,
      unsubscribe: null,
      ref: null,
      items: [],
      first: null,
      second: null,
      third: null,
      sitemaps: [],
      types: ['게시판', '갤러리', '유튜브'],
      form: {
        type: '게시판',
        id: null
      },
      loading: false,
      cards: []
    }
  },
  created () {
    if (this.site && this.site.cards) this.cards = this.site.cards
    setMeta({ title: '메인페이지', description: '메인페이지', image: '/logo.png' })
    this.getSitemapLogs()
    this.subscribe()
  },
  destroyed () {
    if (this.unsubscribe) this.unsubscribe()
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    total () {
      const values = {
        count: 0,
        readCount: 0,
        commentCount: 0,
        likeCount: 0
      }
      this.items.forEach(item => {
        values.count += item.count
        values.readCount += item.readCount
        values.commentCount += item.commentCount
        values.likeCount += item.likeCount
      })
      return values
    },
    sitemapValue () {
      const values = {
        counts: [],
        readCounts: []
      }
      if (!this.sitemaps.length) return values
      this.sitemaps.forEach(item => {
        let countSum = 0
        let readCountSum = 0
        for (const [key, value] of Object.entries(item)) {
          if (key === 'createdAt') continue
          countSum += value.count
          readCountSum += value.readCount
          // console.log(`${key}: ${value.count}`)
        }
        values.counts.push(countSum)
        values.readCounts.push(readCountSum)
      })
      if (this.total.count) values.counts.push(this.total.count)
      if (this.total.readCount) values.readCounts.push(this.total.readCount)
      return values
    },
    boardIds () {
      if (!this.items.length) return []
      const items = this.items.map(item => {
        return { value: item.id, text: `${item.id} (${item.type})` }
      })
      items.unshift({ value: null, text: '전체' })
      return items
    },
    site () {
      return this.$store.state.site
    },
    editable () {
      return this.$store.state.editable
    }
  },
  watch: {
    site (n) {
      if (n.cards === undefined) return
      this.cards = n.cards
    }
  },
  methods: {
    authCheck () {
      if (!this.user) throw Error('로그인이 필요합니다')
      if (this.user.level > 1) throw Error('관리 권한이 필요합니다')
    },
    snapshotToItems (sn) {
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
          findItem.readCount = item.readCount
          findItem.commentCount = item.commentCount
          findItem.likeCount = item.likeCount
          findItem.description = item.description
          findItem.categories = item.categories
          findItem.tags = item.tags
          findItem.type = item.type
          findItem.updatedAt = item.updatedAt.toDate()
        }
      })
    },
    async subscribe () {
      if (this.unsubscribe) this.unsubscribe()
      this.ref = this.$firebase.firestore()
        .collection('boards').limit(LIMIT)
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
    async getSitemapLogs () {
      const sn = await this.$firebase.firestore()
        .collection('sitemapLogs')
        .orderBy('createdAt').limitToLast(4).get()
      if (sn.empty) return
      const items = sn.docs.map(doc => {
        const item = doc.data()
        item.createdAt = item.createdAt.toDate()
        return item
      })
      this.sitemaps = items
    },
    async save () {
      this.authCheck()
      try {
        this.loading = true
        this.$store.commit('setSiteCards', this.cards)
        await this.$firebase.database().ref().child('site').child('cards').set(this.cards)
        this.form.id = ''
      } finally {
        this.loading = false
      }
    },
    add () {
      this.cards.push(this.form)
      this.save()
    },
    remove (i) {
      this.cards.splice(i, 1)
      this.save()
    }
  }
}
</script>
