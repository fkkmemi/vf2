<template>
  <v-container fluid :class="$vuetify.breakpoint.xs ? 'pa-0' : ''">
    <v-card outlined :tile="$vuetify.breakpoint.xs">
      <v-toolbar color="transparent" dense flat>
        <v-toolbar-title>
          개인정보처리방침
        </v-toolbar-title>
      </v-toolbar>
      <v-divider/>
      <privacy-content/>
    </v-card>
  </v-container>
</template>
<script>
import setMeta from '@/util/setMeta'
import PrivacyContent from './content'

export default {
  components: { PrivacyContent },
  created () {
    setMeta({ title: '개인정보처리방침', description: '개인정보처리방침', image: '/logo.png' })
  }
}
</script>
