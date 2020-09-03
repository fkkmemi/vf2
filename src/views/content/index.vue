<template>
  <article-content v-if="!action" :boardId="info" :articleId="article" :category="category" />
  <article-form v-else :boardId="info" :articleId="article" :category="category" :action="action" />
</template>
<script>
import ArticleContent from '@/components/content'
import ArticleForm from '@/components/content/form.vue'
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
    }
  }
}
</script>
