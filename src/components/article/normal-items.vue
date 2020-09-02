<template>
  <v-container fluid :class="$vuetify.breakpoint.xs ? 'pa-0' : ''">
    <v-row :no-gutters="$vuetify.breakpoint.xs">
      <template v-for="(item, i) in items">
        <v-col cols="12" :sm="uid ? null: 6" :md="uid ? null : 4" :lg="uid ? null : 3" :key="item.id">
          <normal-item :index="i + 1" :item="item" :boardId="boardId"/>
          <v-divider :key="i" v-if="$vuetify.breakpoint.xs && i < items.length - 1"/>
        </v-col>
      </template>
      <v-col cols="12" :sm="uid ? null: 6" :md="uid ? null : 4" :lg="uid ? null : 3" v-if="lastDoc">
        <v-card flat width="100%" height="100%" class="d-flex justify-center align-center ma-1">
          <v-btn
            @click="$emit('more')"
            v-intersect="onIntersect"
            color="primary"
            text
            x-large
            :loading="loading">
            <v-icon>mdi-dots-horizontal</v-icon>더보기
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import NormalItem from './normal-item'
export default {
  components: { NormalItem },
  props: ['items', 'lastDoc', 'loading', 'uid', 'boardId'],
  methods: {
    onIntersect (entries, observer, isIntersecting) {
      if (isIntersecting) this.$emit('more')
    }
  }
}
</script>
