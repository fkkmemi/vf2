<template>
  <v-row>
    <v-col cols="12" sm="6">
      <articles :uid="uid"/>

    </v-col>
    <v-col cols="12" sm="6">
      <comments :uid="uid"/>

    </v-col>
  </v-row>
</template>
<script>
import Articles from '@/components/article'
import Comments from '@/components/comment'
export default {
  components: { Articles, Comments },
  props: ['uid']
}
</script>
