<template>
  <article-content v-if="!action" :boardId="info" :articleId="article" :category="category" :tag="tag" />
  <article-form v-else :boardId="info" :articleId="article" :action="action" />
</template>
<script>
import ArticleContent from '@/components/board/article/content'
import ArticleForm from '@/components/board/article/form'
export default {
  components: { ArticleContent, ArticleForm },
  computed: {
    info () {
      return this.$route.params.info
    },
    article () {
      return this.$route.params.article
    },
    action () {
      return this.$route.query.action
    },
    category () {
      return this.$route.query.category
    },
    tag () {
      return this.$route.query.tag
    }
  }
}
</script>
