<template>
  <v-card class="ma-4">
    <v-card-subtitle>게시물 현황</v-card-subtitle>
    <v-card-text>
      <v-sparkline
        :value="values"
        :gradient="['#f72047', '#ffd200', '#1feaea']"
        height="100"
        stroke-linecap="round"
        smooth
        type="trend"
      >
        <!-- <template v-slot:label="item">
          {{ item.value }}
        </template> -->
      </v-sparkline>
      <v-row justify="space-between" class="px-4">
        <span v-for="(item, i) in values" :key="i" class="caption">
          {{ item }}
        </span>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
const LIMIT = 5

export default {
  data () {
    return {
      items: [],
      values: []
    }
  },
  created () {
    this.fetch()
  },
  destroyed () {
  },
  methods: {
    async fetch () {
      const sn = await this.$firebase.firestore()
        .collection('sitemapLogs')
        .orderBy('createdAt').limitToLast(LIMIT).get()
      if (sn.empty) return
      const items = sn.docs.map(doc => {
        const item = doc.data()
        item.createdAt = item.createdAt.toDate()
        return item
      })
      items.forEach(item => {
        let sum = 0
        for (const [key, value] of Object.entries(item)) {
          if (key === 'createdAt') continue
          sum += value.count
          // console.log(`${key}: ${value.count}`)
        }
        this.values.push(sum)
      })
      console.log(this.values)
      this.items = items
    }
  }
}
</script>
