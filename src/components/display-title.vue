<template>
  <div>
    <template v-if="item.important > 0">
      <template v-if="!$vuetify.breakpoint.xs">
        <v-chip
          :color="item.important === 1 ? 'success' : 'warning'"
          label
          small
          class="mr-2"
        >
          <template v-if="item.important === 1">
            <v-icon left small>mdi-bell-ring</v-icon>
            <span>공지</span>
          </template>
          <template v-else>
            <v-icon left small>mdi-alert-circle</v-icon>
            <span>중요</span>
          </template>
        </v-chip>
      </template>
      <template v-else>
        <v-icon v-if="item.important === 1" left color="success">mdi-bell-ring</v-icon>
        <v-icon v-else left color="warning">mdi-alert-circle</v-icon>
      </template>
    </template>
    <v-icon color="error" left v-if="!item.important ? newCheck(item.updatedAt, 'days', 1) : newCheck(item.updatedAt, 'days', 7)">mdi-fire</v-icon>
    <v-tooltip bottom v-if="item.read">
      <template v-slot:activator="{on}">
        <span v-on="on" :class="item.read ? 'secondary--text' : null">{{item.title}}</span>
      </template>
      <span v-if="item.read">{{item.read}} 번 읽음</span>
    </v-tooltip>
    <span v-else>{{item.title}}</span>
    <!-- <v-chip v-if="item.read" color="secondary" x-small outlined class="pr-2"><v-icon left small>mdi-eye</v-icon>{{item.read}}</v-chip> -->
    <v-icon color="accent" right v-if="item.images && item.images.length && !$vuetify.breakpoint.xs">mdi-image</v-icon>
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
