<template>
  <v-container fluid :class="$vuetify.breakpoint.xs ? 'pa-0' : ''">
    <v-card outlined :tile="$vuetify.breakpoint.xs">
      <v-toolbar color="transparent" dense flat>
        <v-toolbar-title>
          설정
        </v-toolbar-title>
      </v-toolbar>
      <v-divider/>
      <item-local/>
      <item-theme/>
      <item-color/>
    </v-card>
  </v-container>

</template>
<script>
import ItemLocal from './item-local'
import ItemTheme from './item-theme'
import ItemColor from './item-color'
import setMeta from '@/util/setMeta'

export default {
  components: { ItemLocal, ItemTheme, ItemColor },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  created () {
    setMeta({ title: '일반 설정', description: '일반 설정', image: '/logo.png' })
  }
}
</script>
