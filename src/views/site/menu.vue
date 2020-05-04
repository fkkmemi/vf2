<template>
  <div>
    <v-list-item v-for="item in items" :key="item.title" :to="item.to">
      <v-list-item-content>
        {{ item.title }}
      </v-list-item-content>
    </v-list-item>
  </div>
</template>
<script>
export default {
  props: ['footer'],
  data () {
    return {
      items: [
        {
          title: 'home',
          to: '/'
        },
        {
          title: 'about',
          to: '/about'
        },
        {
          title: 'xxx',
          to: '/xxx'
        }
      ]
    }
  }
}
</script>
