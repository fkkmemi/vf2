<template>
  <v-list>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          작성자
        </v-list-item-title>
        <v-list-item-subtitle class="pt-2">
          <display-user :user="article.user" :uid="article.uid" size="small"></display-user>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          작성일
        </v-list-item-title>
        <v-list-item-subtitle class="font-italic">
          <display-time :time="article.createdAt"></display-time>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          수정일
        </v-list-item-title>
        <v-list-item-subtitle class="font-italic">
          <display-time :time="article.updatedAt"></display-time>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          조회수
        </v-list-item-title>
        <v-list-item-subtitle>
          {{article.readCount}}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          댓글수
        </v-list-item-title>
        <v-list-item-subtitle>
          {{article.commentCount}}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          좋아요수
        </v-list-item-title>
        <v-list-item-subtitle>
          {{article.likeCount}}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          종류
        </v-list-item-title>
        <v-list-item-subtitle>
          <v-chip
            color="primary"
            label
            small
            outlined
            :to="`/board/${boardId}?category=${article.category}`"
            exact
            class="mt-2">
            <span class="caption">{{article.category}}</span>
          </v-chip>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          태그
        </v-list-item-title>
        <v-list-item-subtitle class="white-space">
          <v-chip
            color="info"
            label
            small
            outlined
            v-for="item in article.tags"
            :key="item"
            class="mt-2 mr-2"
            :to="`/search?text=${item}`"
            v-text="item"></v-chip>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>
<script>
import DisplayTime from '@/components/display-time'
import DisplayUser from '@/components/display-user'
export default {
  components: { DisplayTime, DisplayUser },
  props: ['article', 'boardId']

}
</script>
