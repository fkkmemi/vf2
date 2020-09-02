<template>
  <div>
    <template v-for="(item, i) in items">
      <compact-item :key="item.id" :index="i + 1" :item="item" :widget="widget" :boardId="boardId"/>
      <v-divider :key="i" v-if="i < items.length - 1"/>
    </template>
    <v-list-item v-if="lastDoc && !widget">
      <v-btn
        @click="$emit('more')"
        v-intersect="onIntersect"
        color="primary"
        text
        x-large
        :loading="loading">
        <v-icon>mdi-dots-horizontal</v-icon>더보기
      </v-btn>
    </v-list-item>
  </div>
</template>
<script>
import CompactItem from './compact-item'
export default {
  components: { CompactItem },
  props: ['items', 'lastDoc', 'loading', 'uid', 'widget', 'boardId'],
  methods: {
    onIntersect (entries, observer, isIntersecting) {
      if (isIntersecting) this.$emit('more')
    }
  }
}
</script>
