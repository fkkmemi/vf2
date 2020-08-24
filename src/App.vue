<template>
  <v-app>
    <v-app-bar app color="primary" dark :clipped-left="$vuetify.breakpoint.lgAndUp">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <site-title v-if="!searchable" :title="site.title"></site-title>
      <v-spacer/>
      <site-search v-show="searchable" class="mx-2"/>
      <v-btn icon @click="searchable=!searchable">
        <v-icon>{{searchable ? 'mdi-magnify-close' : 'mdi-magnify'}}</v-icon>
      </v-btn>
      <site-sign></site-sign>
    </v-app-bar>
    <v-navigation-drawer
      app
      fixed
      disable-resize-watcher
      :width="$store.state.editable ? 380 : 256"
      v-model="drawer">
      <site-menu :items="site.menu" @close="drawer=false"></site-menu>
    </v-navigation-drawer>
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
import SiteSign from '@/views/site/sign'
import SiteSearch from '@/views/site/search'
import BannerEmailConfirm from '@/components/banner-email-confirm'

export default {
  components: { SiteTitle, SiteFooter, SiteMenu, SiteSign, SiteSearch, BannerEmailConfirm },
  name: 'App',
  data () {
    return {
      drawer: false,
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
        title: '타이틀 로드중 ...',
        footer: '바닥 로드중 ...'
      },
      offsetTop: 0,
      searchable: false
    }
  },
  computed: {
    user () {
      return this.$store.state.user
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
        if (!v) {
          this.$firebase.database().ref().child('site').set(this.site)
          return
        }
        this.site = v
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
<style>
.white-space {
  white-space: pre-wrap;
}
</style>
