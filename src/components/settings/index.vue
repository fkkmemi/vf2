<template>
  <v-container fluid :class="$vuetify.breakpoint.xs ? 'pa-0' : ''">
    <v-card outlined :tile="$vuetify.breakpoint.xs">
      <v-toolbar color="transparent" dense flat>
        <v-toolbar-title>
          설정
        </v-toolbar-title>
      </v-toolbar>
      <v-divider/>
      <v-list-item>
        <v-list-item-icon>
          <v-icon>mdi-cookie</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>로컬 설정 지우기</v-list-item-title>
          <v-list-item-subtitle>로컬에 저장되어 있는 게시물뷰, 캐시데이터, 읽은 페이지 기록을 삭제 합니다.</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn icon @click="clearLocalStorage" color="error"><v-icon>mdi-delete</v-icon></v-btn>
        </v-list-item-action>
      </v-list-item>
      <v-list-item>
        <v-list-item-icon>
          <v-icon>mdi-brightness-6</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>테마 변경</v-list-item-title>
          <v-list-item-subtitle>밝은 테마와 어두운 테마로 조정이 가능합니다</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-switch
            :value="$vuetify.theme.dark"
            @change="toggleDark"/>
        </v-list-item-action>
      </v-list-item>
    </v-card>
  </v-container>

</template>
<script>
import setMeta from '@/util/setMeta'

export default {
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  created () {
    setMeta({ title: '일반 설정', description: '일반 설정', image: '/logo.png' })
  },
  methods: {
    async clearLocalStorage () {
      const r = await this.$swal.fire({
        title: '정말 삭제하시겠습니까?',
        text: '삭제 후 되돌릴 수 없습니다.',
        icon: 'error',
        // confirmButtonText: 'Cool',
        showCancelButton: true
      })
      if (!r.value) return

      const items = []
      const keys = []
      for (const key in localStorage) {
        const ls = key.split('-')
        if (ls.length !== 3) continue
        const item = {
          boardId: ls[0],
          articleId: ls[1],
          value: ls[2]
        }
        if (item.articleId.length !== 13) continue
        if (item.value !== 'read') continue
        if (keys.indexOf(item.boardId) < 0) keys.push(item.boardId)
        items.push(key)
      }
      while (items.length) {
        localStorage.removeItem(items.shift())
      }
      while (keys.length) {
        this.$store.commit('setCached', {
          boardId: keys.shift(),
          lastDoc: null,
          items: [],
          articleId: null
        })
      }
      if (this.$store.state.boardTypeList) this.$store.commit('toggleBoardType')
    },
    toggleDark () {
      const dark = JSON.parse(localStorage.getItem('site-theme-dark'))
      this.$vuetify.theme.dark = !dark
      localStorage.setItem('site-theme-dark', !dark)
    }
  }
}
</script>
