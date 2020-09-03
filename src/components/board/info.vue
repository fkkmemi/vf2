<template>
  <v-list>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-subtitle class="white-space">
          <v-alert type="info" outlined>
            {{board.description}}
          </v-alert>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          게시물수
        </v-list-item-title>
        <v-list-item-subtitle>
          {{board.count}}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          조회수
        </v-list-item-title>
        <v-list-item-subtitle>
          {{board.readCount}}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          댓글수
        </v-list-item-title>
        <v-list-item-subtitle>
          {{board.commentCount}}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          좋아요수
        </v-list-item-title>
        <v-list-item-subtitle>
          {{board.likeCount}}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          게시판 유형
        </v-list-item-title>
        <v-list-item-subtitle>
          {{board.type}}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          게시판 이름
        </v-list-item-title>
        <v-list-item-subtitle>
          {{board.title}}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          작성자
        </v-list-item-title>
        <v-list-item-subtitle class="pt-2">
          <display-user :user="board.user" :uid="board.uid" size="small"></display-user>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          작성일
        </v-list-item-title>
        <v-list-item-subtitle class="font-italic">
          <display-time :time="board.createdAt"></display-time>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          수정일
        </v-list-item-title>
        <v-list-item-subtitle class="font-italic">
          <display-time :time="board.updatedAt"></display-time>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          등록된 종류
        </v-list-item-title>
        <v-list-item-subtitle class="white-space">
          <v-chip
            color="primary"
            label
            small
            outlined
            v-for="item in board.categories"
            :key="item"
            :to="item === '전체' ? `/board/${board.id}` : `/board/${board.id}?category=${item}`"
            exact
            class="mt-2 mr-2">
            <span class="caption mr-2">{{item}}</span>
            <span class="caption" v-if="item === '전체'"> ({{board.count}})</span>
            <span class="caption" v-else> ({{board.categoryCount[item]}})</span>
          </v-chip>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title>
          등록된 태그
        </v-list-item-title>
        <v-list-item-subtitle class="white-space">
          <v-chip
            color="info"
            label
            small
            outlined
            v-for="item in board.tags"
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
  props: ['board']
}
</script>
