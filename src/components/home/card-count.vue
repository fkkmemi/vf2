<template>
  <v-card class="mx-4">
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

export default {
  props: ['items'],
  computed: {
    values () {
      const vals = []
      this.items.forEach(item => {
        let sum = 0
        for (const [key, value] of Object.entries(item)) {
          if (key === 'createdAt') continue
          sum += value.count
          // console.log(`${key}: ${value.count}`)
        }
        vals.push(sum)
      })
      return vals
    }
  }
}
</script>
