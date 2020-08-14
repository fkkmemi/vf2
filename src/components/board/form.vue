<template>
  <v-container v-if="!loaded" fluid>
    <v-skeleton-loader type="card"></v-skeleton-loader>
  </v-container>
  <v-container v-else-if="loaded && !user || (user && user.level > 0)" fluid>
    <v-alert type="warning" border="left" class="mb-0">
      게시판 생성은 관리자만 할 수 있습니다
    </v-alert>
  </v-container>
  <v-container v-else fluid :class="$vuetify.breakpoint.xs ? 'pa-0' : ''">
    <v-form>
      <v-card :loading="loading" outlined :tile="$vuetify.breakpoint.xs">
        <v-toolbar color="transparent" dense flat>
          <v-toolbar-title>게시판 정보 작성</v-toolbar-title>
        <v-spacer/>
        <v-btn icon @click="save" :disabled="user && user.level !== 0"><v-icon>mdi-content-save</v-icon></v-btn>
        <v-btn icon @click="$router.push('/board/' + boardId)"><v-icon>mdi-close</v-icon></v-btn>
        </v-toolbar>
        <v-divider/>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="4">
              <v-text-field v-model="form.category" outlined label="게시판 종류"></v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
              <v-select v-model="form.type" :items="types" outlined label="게시판 유형" :disabled="exists"></v-select>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="form.title" outlined label="제목"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="form.description" outlined label="설명" hide-details></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text>
          <v-card outlined>
            <v-subheader>등록된 종류</v-subheader>
            <v-card-text>
              <v-chip
                color="primary"
                outlined
                label
                small
                v-for="(item, i) in form.categories"
                :key="i"
                class="mr-2 mb-2">
                <span class="caption mr-2">{{item}}</span>
                <span class="caption"> {{form.categoryCount[item]}}</span>
                <v-icon small right @click="removeCategory(item, i)">mdi-close</v-icon>
              </v-chip>
            </v-card-text>
            <v-card-actions>
              <div width="100">
                <v-text-field
                  v-model="category"
                  append-icon="mdi-plus"
                  label="등록"
                  placeholder="eg) social"
                  hide-details
                  outlined
                  dense
                  @click:append="saveCategory"
                  @keypress.enter="saveCategory"
                />
              </div>
            </v-card-actions>
          </v-card>
        </v-card-text>
        <v-card-text>
          <v-card outlined>
            <v-subheader>등록된 태그</v-subheader>
            <v-card-text>
              <v-chip
                color="info"
                label
                small
                outlined
                v-for="(item, i) in form.tags"
                :key="i"
                class="mr-2 mb-2">
                {{item}} <v-icon small right @click="removeTag(item, i)">mdi-close</v-icon>
              </v-chip>
            </v-card-text>
            <v-card-actions>
              <div width="100">
                <v-text-field
                  v-model="tag"
                  append-icon="mdi-plus"
                  label="등록"
                  placeholder="eg) vuetify"
                  hide-details
                  outlined
                  dense
                  @click:append="saveTag"
                  @keypress.enter="saveTag"
                />
              </div>

            </v-card-actions>
          </v-card>
        </v-card-text>
      </v-card>
    </v-form>
  </v-container>
</template>
<script>
import setMeta from '@/util/setMeta'

export default {
  props: ['boardId', 'action'],
  data () {
    return {
      form: {
        category: '',
        title: '',
        description: '',
        categories: [],
        tags: [],
        type: '',
        categoryCount: {}
      },
      exists: false,
      loading: false,
      ref: null,
      category: '',
      tag: '',
      loaded: false,
      types: ['일반', '갤러리', '페이지'],
      beforeCategories: []
      // categoryCount: {}
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  watch: {
    boardId () {
      this.fetch()
    }
  },
  created () {
    this.fetch()
  },
  methods: {
    async fetch () {
      setMeta({
        title: '게시판 수정',
        description: '게시판을 만들거나 수정합니다',
        image: '/logo.png'
      })
      this.ref = this.$firebase.firestore().collection('boards').doc(this.boardId)
      this.loaded = false
      const doc = await this.ref.get()
      this.loaded = true
      this.exists = doc.exists
      if (!this.exists) return
      const item = doc.data()
      this.form.category = item.category
      this.form.title = item.title
      this.form.description = item.description
      this.form.categories = item.categories
      this.form.tags = item.tags
      this.form.type = item.type
      this.form.categoryCount = item.categoryCount || {}
      this.beforeCategories = item.categories.slice(0)
    },
    async save () {
      if (!this.$store.state.fireUser) throw Error('로그인이 필요합니다')
      if (!this.form.category || !this.form.title) throw Error('종류 제목은 필수 항목입니다')

      const r = await this.$swal.fire({
        title: '정말 추가/변경 하시겠습니까?',
        text: '처음 추가 후 게시판 형태를 변경할 수 없습니다.',
        icon: 'warning',
        // confirmButtonText: 'Cool',
        showCancelButton: true
      })
      if (!r.value) return
      const createdAt = new Date()
      const doc = {
        category: this.form.category,
        title: this.form.title,
        description: this.form.description,
        categories: this.form.categories,
        tags: this.form.tags,
        type: this.form.type,
        updatedAt: createdAt,
        categoryCount: this.form.categoryCount
      }
      this.loading = true
      try {
        if (!this.exists) {
          doc.createdAt = createdAt
          doc.count = 0
          doc.uid = this.$store.state.fireUser.uid
          doc.user = {
            email: this.$store.state.user.email,
            photoURL: this.$store.state.user.photoURL,
            displayName: this.$store.state.user.displayName
          }
          doc.readCount = 0
          doc.commentCount = 0
          doc.likeCount = 0
          await this.ref.set(doc)
        } else {
          this.beforeCategories.forEach(before => {
            const c = this.form.categories.find(after => before === after)
            if (!c) doc[`categoryCount.${before}`] = this.$firebase.firestore.FieldValue.delete()
          })
          this.form.categories.forEach(after => {
            const c = this.beforeCategories.find(before => before === after)
            if (!c) doc[`categoryCount.${after}`] = 0
          })

          await this.ref.update(doc)
        }
        this.$router.push('/board/' + this.boardId)
      } finally {
        this.loading = false
      }
    },
    saveCategory () {
      if (this.category.length > 20) throw Error('문자 개수를 초과했습니다')
      if (this.category === '전체') throw Error('전체는 사용 불가능합니다')
      const exists = this.form.categories.includes(this.category)
      if (exists) throw Error('사용되고 있는 종류입니다')
      this.form.categories.push(this.category)
      this.form.categoryCount[this.category] = 0
      this.category = ''
    },
    async removeCategory (item, i) {
      const sn = await this.ref.collection('articles').where('category', '==', item).limit(1).get()
      if (!sn.empty) throw Error('사용되고 있는 종류입니다')
      this.form.categories.splice(i, 1)
      delete this.form.categoryCount[item]
    },
    saveTag () {
      if (this.tag.length > 20) throw Error('문자 개수를 초과했습니다')
      const exists = this.form.tags.includes(this.tag)
      if (exists) throw Error('사용되고 있는 태그입니다')
      this.form.tags.push(this.tag)
      this.tag = ''
    },
    async removeTag (item, i) {
      const sn = await this.ref.collection('articles').where('tags', 'array-contains', item).limit(1).get()
      if (!sn.empty) throw Error('사용되고 있는 태그입니다')
      this.form.tags.splice(i, 1)
    }
  }
}
</script>
