<template>
  <v-container fluid :class="$vuetify.breakpoint.xs ? 'pa-0' : ''">
    <v-card height="190">
      <v-subheader>
        <v-icon left>mdi-format-list-bulleted</v-icon>
        게시물 현황
        <v-spacer/>
        <v-tooltip bottom>
          <template v-slot:activator="{on}">
            <span v-on="on">{{total.count}}</span>
          </template>
          <div>
            <v-sheet
              width="140"
              color="transparent"
              dark
              class="d-flex justify-space-between"
              v-for="(item, i) in items"
              :key="item.id">
              <span>{{item.createdAt.toLocaleDateString()}}</span>
              <span>{{values[i]}}</span>
            </v-sheet>
            <!-- <v-sheet
              width="140"
              color="transparent"
              dark
              class="d-flex justify-space-between">
              <span>현재 </span>
              <span>{{values[values.length - 1]}}</span>
            </v-sheet> -->
          </div>
        </v-tooltip>
      </v-subheader>
      <v-card-text>
        <v-sheet color="transparent">
          <v-sparkline
            :value="values"
            :gradient="['#f72047', '#ffd200', '#1feaea']"
            stroke-linecap="round"
            :smooth="10"
            auto-draw
            :line-width="4"
          >
            <!-- <template v-slot:label="item">
              {{ item.value }}
            </template> -->
          </v-sparkline>
        </v-sheet>
        <!-- <v-row justify="space-between" class="px-4">
          <span v-for="(item, i) in values" :key="i" class="caption">
            {{ item }}
          </span>
        </v-row> -->
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>

export default {
  props: ['total', 'values', 'items']
}
</script>
