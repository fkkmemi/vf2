<template>
  <v-app>
    <v-app-bar app :color="$vuetify.theme.dark ? null : 'white'" flat :clipped-left="$vuetify.breakpoint.lgAndUp">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <site-title v-if="(!searchable && $vuetify.breakpoint.xs) || !$vuetify.breakpoint.xs" :title="site.title"></site-title>
      <v-spacer/>
      <template v-if="isIndexEnable">
        <site-search v-show="searchable" class="mx-2"/>
        <v-btn icon @click="searchable=!searchable">
          <v-icon>{{searchable ? 'mdi-magnify-close' : 'mdi-magnify'}}</v-icon>
        </v-btn>
      </template>
      <v-badge
        v-if="user"
        :content="user.messageCount || null"
        :value="user.messageCount || null"
        color="success"
        overlap
        class="mx-4"
      >
        <v-btn icon small>
          <v-icon @click="drawerChat=true" >mdi-chat</v-icon>
        </v-btn>
        <!-- <v-progress-circular v-if="loading" indeterminate></v-progress-circular>
        <v-icon v-else>mdi-forum</v-icon> -->

      </v-badge>

      <site-sign></site-sign>
    </v-app-bar>
    <v-navigation-drawer
      app
      fixed
      disable-resize-watcher
      :width="$store.state.editable ? 380 : 256"
      v-model="drawer">
      <template v-slot:default>
        <site-menu :items="site.menu" @close="drawer=false"></site-menu>
      </template>
      <template v-slot:append>
        <site-menu-bottom/>
      </template>
    </v-navigation-drawer>
    <chat :drawerStart="drawerChat" @close="drawerChat=false"/>

    <v-main onscroll="onScroll">
      <banner-email-confirm v-if="user && !user.emailVerified" />
      <router-view/>
      <v-sheet color="transparent" height="70" v-show="offsetTop > 500" />
      <v-fab-transition>
        <v-btn
          v-show="offsetTop > 500"
          color="pink"
          dark
          absolute
          bottom
          right
          fab
          fixed
          style="bottom: 50px; transform-origin: center center;"
          @click="$vuetify.goTo(0)"
        >
          <v-icon>mdi-chevron-up</v-icon>
        </v-btn>
      </v-fab-transition>
    </v-main>
    <site-footer :footer="site.footer"></site-footer>
  </v-app>
</template>

<script>
import SiteTitle from '@/views/site/title'
import SiteFooter from '@/views/site/footer'
import SiteMenu from '@/views/site/menu'
import SiteMenuBottom from '@/views/site/menu-bottom'
import SiteSign from '@/views/site/sign'
import SiteSearch from '@/views/site/search'
import BannerEmailConfirm from '@/components/banner-email-confirm'
import Chat from '@/components/chat'

export default {
  components: { SiteTitle, SiteFooter, SiteMenu, SiteMenuBottom, SiteSign, SiteSearch, BannerEmailConfirm, Chat },
  name: 'App',
  data () {
    return {
      drawer: false,
      drawerChat: false,
      site: {
        menu: [
          {
            title: '메뉴 로드중 ...',
            icon: 'mdi-home',
            subItems: [
              {
                title: '홈',
                to: '/',
                createdAt: new Date('2000-01-01'),
                level: 5
              }
            ],
            createdAt: new Date('2000-01-01'),
            level: 5
          }
        ],
        title: '제목 로드중 ...',
        footer: '바닥 로드중 ...'
      },
      offsetTop: 0,
      searchable: false
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    isIndexEnable () {
      return !!this.$index
    }
  },
  created () {
    this.subscribe()
  },
  mounted () {
    window.addEventListener('scroll', this.onScroll)
  },
  beforeDestroy () {
    window.removeEventListener('scroll', this.onScroll)
  },
  methods: {
    subscribe () {
      this.$firebase.database().ref().child('site').on('value', (sn) => {
        const v = sn.val()
        if (!v) return
        this.site = v
        this.$store.commit('setSite', v)
      }, (e) => {
        console.error(e.message)
      })
    },
    onScroll (e) {
      this.offsetTop = window.scrollY
    }
  }
}
</script>
<style lang="scss">
  // .tui-editor-contents {
  //   h1, h2, h3, h4, h5, h6, p, ul, li, pre, table {
  //     color: var(--v-primary-base) !important
  //   }
  //   code, span {
  //     color: rgb(50, 50, 50) !important
  //   }
  // }
  .tui-dark {
    h1, h2, h3, h4, h5, h6, p, ul, li, pre, table, ol {
      color: var(--v-primary-base) !important
    }
    code, span {
      color: rgb(50, 50, 50) !important
    }
  }
  // .te-preview {
  //   background-color: white
  // }
  .white-space {
    white-space: pre-wrap
  }
</style>
