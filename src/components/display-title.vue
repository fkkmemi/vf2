<template>
  <div>
    <v-chip
      v-if="item.important && item.important > 0"
      :color="item.important === 1 ? 'success' : 'warning'"
      label
      small
      class="mr-2"
    >
      <template v-if="item.important === 1">
        <v-icon left small>mdi-bell-ring</v-icon>
        공지

      </template>
      <template v-else>
        <v-icon left small>mdi-alert-circle</v-icon>
        중요
      </template>
    </v-chip>

    <v-icon color="error" left v-if="newCheck(item.updatedAt)">mdi-fire</v-icon>
    <span v-text="item.title"></span>
    <v-icon right v-if="item.images && item.images.length">mdi-image</v-icon>
  </div>
</template>
<script>
import newCheck from '@/util/newCheck'

export default {
  props: ['item'],
  data () {
    return {
      newCheck
    }
  }
}
</script>
