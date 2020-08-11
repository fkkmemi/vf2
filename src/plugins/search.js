import Vue from 'vue'
import AlgoliaSearch from 'algoliasearch'

const client = AlgoliaSearch(process.env.VUE_APP_ALGOLIA_APP_ID, process.env.VUE_APP_ALGOLIA_SEARCH_KEY)
const index = client.initIndex('boards')
Vue.prototype.$index = index
