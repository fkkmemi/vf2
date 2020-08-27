<template>
  <v-container fluid :class="$vuetify.breakpoint.xs ? 'pa-0' : ''">
    <v-card outlined :tile="$vuetify.breakpoint.xs">
      <v-toolbar color="transparent" dense flat>
        <v-toolbar-title>
          이용약관
        </v-toolbar-title>
      </v-toolbar>
      <v-divider/>
      <terms-content/>
    </v-card>
  </v-container>
</template>
<script>
import setMeta from '@/util/setMeta'
import TermsContent from './content'

export default {
  components: { TermsContent },
  created () {
    setMeta({ title: '이용약관', description: '이용약관', image: '/logo.png' })
  }
}
</script>
