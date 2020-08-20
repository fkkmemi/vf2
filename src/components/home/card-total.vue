<template>
  <v-card class="mx-4" height="100%">
    <v-list>
      <v-list-item>
        <v-list-item-icon>
          <v-icon>mdi-comment</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-subtitle>
            댓글
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <span class="caption">{{item.commentCount}}</span>
        </v-list-item-action>
      </v-list-item>
      <v-list-item>
        <v-list-item-icon>
          <v-icon>mdi-thumb-up</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-subtitle>
            좋아요
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <span class="caption">{{item.likeCount}}</span>
        </v-list-item-action>
      </v-list-item>
      <v-list-item>
        <v-list-item-icon>
          <v-icon>mdi-account-group</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-subtitle>
            사용자
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <span class="caption">{{userCount}}</span>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-card>
</template>
<script>
export default {
  props: ['item', 'items'],
  data () {
    return {
      userCount: 0
    }
  },
  created () {
    this.getUserCount()
  },
  methods: {
    async getUserCount () {
      const doc = await this.$firebase.firestore()
        .collection('meta').doc('users').get()
      if (doc.exists) this.userCount = doc.data().count
    }
  }
}
</script>
