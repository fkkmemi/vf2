<template>
  <v-card class="mx-4" height="100%">
    <v-subheader>
      <v-icon left>mdi-format-list-bulleted</v-icon>
      게시물 현황
      <v-spacer/>
      {{total.count}}
    </v-subheader>
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
      <!-- <v-row justify="space-between" class="px-4">
        <span v-for="(item, i) in values" :key="i" class="caption">
          {{ item }}
        </span>
      </v-row> -->
    </v-card-text>
  </v-card>
</template>
<script>

export default {
  props: ['total', 'values']
}
</script>
