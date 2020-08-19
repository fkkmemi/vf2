<template>
  <v-card class="mx-4" height="100%">
    <!-- <v-card-subtitle>집계</v-card-subtitle> -->
    <v-list-item>
      <v-list-item-content>
        <v-list-item-subtitle>
          조회수
        </v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-action>
        <span class="caption">{{item.readCount}}</span>
      </v-list-item-action>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-subtitle>
          댓글수
        </v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-action>
        <span class="caption">{{item.commentCount}}</span>
      </v-list-item-action>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-subtitle>
          좋아요수
        </v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-action>
        <span class="caption">{{item.likeCount}}</span>
      </v-list-item-action>
    </v-list-item>
  </v-card>
</template>
<script>
import { last } from 'lodash'

export default {
  props: ['items'],
  computed: {
    // item () {
    //   return last(this.items)
    // },
    item () {
      const lastItem = last(this.items)

      const values = {
        readCount: 0,
        commentCount: 0,
        likeCount: 0
      }
      for (const [key, value] of Object.entries(lastItem)) {
        if (key === 'createdAt') continue
        values.readCount += value.readCount
        values.commentCount += value.commentCount
        values.likeCount += value.likeCount
        // console.log(`${key}: ${value.count}`)
      }
      return values
    }
  }
}
</script>
