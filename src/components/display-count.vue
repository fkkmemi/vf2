<template>
  <div v-if="column" class="d-flex flex-column justify-space-between" style="width:50px">
    <div class="d-flex justify-space-between align-center">
      <v-icon left :color="item.readCount ? 'info' : ''">mdi-eye</v-icon>
      <span class="body-2" v-if="item.readCount < 100">{{item.readCount}}</span>
      <v-tooltip bottom v-else>
        <template v-slot:activator="{on}">
          <span class="body-2" v-on="on">99+</span>
        </template>
        <span>{{item.readCount}}</span>
      </v-tooltip>
    </div>
    <div class="d-flex justify-space-between align-center">
      <v-icon left :color="item.commentCount ? 'info' : ''">mdi-comment</v-icon>
      <span class="body-2" v-if="item.commentCount < 100">{{item.commentCount}}</span>
      <v-tooltip bottom v-else>
          <template v-slot:activator="{on}">
            <span class="body-2" v-on="on">99+</span>
          </template>
          <span>{{item.commentCount}}</span>
        </v-tooltip>
    </div>
    <div class="d-flex justify-space-between align-center">
      <v-icon left :color="liked(item) ? 'success' : ''">mdi-thumb-up</v-icon>
      <span class="body-2" v-if="item.likeCount < 100">{{item.likeCount}}</span>
      <v-tooltip bottom v-else>
        <template v-slot:activator="{on}">
          <span class="body-2" v-on="on">99+</span>
        </template>
        <span>{{item.likeCount}}</span>
      </v-tooltip>
    </div>
  </div>
  <div v-else class="d-flex justify-end align-center">
    <template v-if="size !== 'small'">
      <div class="d-flex align-center mr-2">
        <v-icon left :color="item.readCount ? 'info' : ''">mdi-eye</v-icon>
        <span class="body-2" v-if="item.readCount < 100">{{item.readCount}}</span>
        <v-tooltip bottom v-else>
          <template v-slot:activator="{on}">
            <span class="body-2" v-on="on">99+</span>
          </template>
          <span>{{item.readCount}}</span>
        </v-tooltip>
      </div>
      <div class="d-flex align-center mr-2">
        <v-icon left :color="item.commentCount ? 'info' : ''">mdi-comment</v-icon>
        <span class="body-2" v-if="item.commentCount < 100">{{item.commentCount}}</span>
        <v-tooltip bottom v-else>
          <template v-slot:activator="{on}">
            <span class="body-2" v-on="on">99+</span>
          </template>
          <span>{{item.commentCount}}</span>
        </v-tooltip>
      </div>
      <div class="d-flex align-center">
        <v-icon left :color="liked(item) ? 'success' : ''">mdi-thumb-up</v-icon>
        <span class="body-2" v-if="item.likeCount < 100">{{item.likeCount}}</span>
        <v-tooltip bottom v-else>
          <template v-slot:activator="{on}">
            <span class="body-2" v-on="on">99+</span>
          </template>
          <span>{{item.likeCount}}</span>
        </v-tooltip>
      </div>
    </template>
    <template v-else>
      <div class="d-flex align-center mr-2">
        <v-icon left small :color="item.readCount ? 'info' : ''">mdi-eye</v-icon>
        <span class="caption" v-if="item.readCount < 100">{{item.readCount}}</span>
        <v-tooltip bottom v-else>
          <template v-slot:activator="{on}">
            <span class="body-2" v-on="on">99+</span>
          </template>
          <span>{{item.readCount}}</span>
        </v-tooltip>
      </div>
      <div class="d-flex align-center mr-2">
        <v-icon left small :color="item.commentCount ? 'info' : ''">mdi-comment</v-icon>
        <span class="caption" v-if="item.commentCount < 100">{{item.commentCount}}</span>
        <v-tooltip bottom v-else>
          <template v-slot:activator="{on}">
            <span class="body-2" v-on="on">99+</span>
          </template>
          <span>{{item.commentCount}}</span>
        </v-tooltip>
      </div>
      <div class="d-flex align-center">
        <v-icon left small :color="liked(item) ? 'success' : ''">mdi-thumb-up</v-icon>
        <span class="caption" v-if="item.likeCount < 100">{{item.likeCount}}</span>
        <v-tooltip bottom v-else>
          <template v-slot:activator="{on}">
            <span class="body-2" v-on="on">99+</span>
          </template>
          <span>{{item.likeCount}}</span>
        </v-tooltip>
      </div>
    </template>
  </div>
</template>
<script>
export default {
  props: ['item', 'column', 'size'],
  computed: {
    fireUser () {
      return this.$store.state.fireUser
    }
  },
  methods: {
    liked (item) {
      if (!this.fireUser) return false
      return item.likeUids.includes(this.fireUser.uid)
    }
  }
}
</script>
