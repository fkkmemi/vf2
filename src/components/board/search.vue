<template>
  <v-container v-if="!loaded" fluid>
    <v-skeleton-loader type="article" v-for="i in 4" :key="i"></v-skeleton-loader>
  </v-container>
  <v-container fluid v-else-if="loaded && result && !result.hits.length">
    <v-alert type="warning" border="left" class="mb-0">
      검색된 내용이 없습니다
    </v-alert>
  </v-container>
  <v-container v-else fluid class="">
    <v-alert border="left" color="info" outlined>
      <v-card-title class="body-1">
        <v-icon>mdi-magnify</v-icon>
        <span class="font-weight-bold mr-1">{{text}}</span>
        (으)로 검색된 게시물 은 총
        <span class="font-weight-bold ml-1">{{result.nbHits}}</span>
        건 입니다
        <v-spacer/>
        <!-- free plan need logo!! https://www.algolia.com/press/?section=guidelines -->
        <v-img contain :max-width="120" src="https://res.cloudinary.com/hilnmyskv/image/upload/q_auto/v1595410010/Algolia_com_Website_assets/images/shared/algolia_logo/search-by-algolia-light-background.svg"></v-img>
      </v-card-title>
    </v-alert>
    <template v-for="(hit) in result.hits">
      <display-search-item :item="hit" :key="hit.objectId" />
    </template>
  </v-container>
</template>
<script>
import DisplaySearchItem from '@/components/display-search-item'
import setMeta from '@/util/setMeta'

export default {
  components: { DisplaySearchItem },
  props: ['text'],
  data () {
    return {
      loaded: false,
      result: null
    }
  },
  watch: {
    text () {
      this.fetch()
    }
  },
  created () {
    this.fetch()
  },
  destroyed () {
    if (this.text) this.$store.commit('setSearchText', '')
  },
  methods: {
    async fetch () {
      if (this.text) this.$store.commit('setSearchText', this.text)
      setMeta({
        title: '검색 ' + this.text,
        description: '검색 ' + this.text,
        image: '/logo.png'
      })
      try {
        // if (this.text.length < 2) throw Error('최소 2글자 이상 입력하세요.. 돈이 없어서 한글자는 힘들어요')
        this.loaded = false
        const r = await this.$index.search(this.text)
        r.hits.forEach(hit => {
          hit.content = hit.content.substr(0, 300)
          hit.createdAt = new Date(hit.createdAt)
          hit.updatedAt = new Date(hit.updatedAt)
        })
        this.result = r
        // this.result = {
        //   hits: [
        //     { boardId: 'new', articleId: '1597111925832', readCount: 999, commentCount: 40, likeCount: 30, createdAt: '2020-08-11T02:12:39.891Z', title: '8·4대책 1주일.."이 정도 대책이면 떨어져야 하는 데 희한하네"', content: "<span class=\"colour\" style=\"color: rgb(51, 51, 51);\">(서울=연합뉴스) 김동규 홍국기 기자 = 정부가 6·17대책과 7·10대책으로 부동산 수요를 억누른 데 이어 13만2천가구 공급 계획이 담긴 8·4 대책을 발표한 지 일주일이 지났지만, 부동산 시장의 뚜렷한 변화는 나타나지 않고 있다.</span>\n<span class=\"colour\" style=\"color: rgb(51, 51, 51);\">다만, 기존 대책들과 맞물려 서울 외곽에서 다주택자·법인의 매물이 하나둘씩 나오고 있고, '패닉 바 ...", email: 'fkkmemi@gmail.com', displayName: 'memi dev', category: 'test', tags: ['vue', 'firebase', 'test'], objectID: '45493472', _highlightResult: { boardId: { value: 'new', matchLevel: 'none', matchedWords: [] }, articleId: { value: '1597111925832', matchLevel: 'none', matchedWords: [] }, createdAt: { value: '2020-08-11T02:12:39.891Z', matchLevel: 'none', matchedWords: [] }, title: { value: '8·4대책 1주일.."이 정도 대책이면 떨어져야 하는 데 희한하네"', matchLevel: 'none', matchedWords: [] }, content: { value: "<span class=\"colour\" style=\"color: rgb(51, 51, 51);\">(서울=연합<em>뉴스</em>) 김동규 홍국기 기자 = 정부가 6·17대책과 7·10대책으로 부동산 수요를 억누른 데 이어 13만2천가구 공급 계획이 담긴 8·4 대책을 발표한 지 일주일이 지났지만, 부동산 시장의 뚜렷한 변화는 나타나지 않고 있다.</span>\n<span class=\"colour\" style=\"color: rgb(51, 51, 51);\">다만, 기존 대책들과 맞물려 서울 외곽에서 다주택자·법인의 매물이 하나둘씩 나오고 있고, '패닉 바 ...", matchLevel: 'full', fullyHighlighted: false, matchedWords: ['뉴', '스'] }, email: { value: 'fkkmemi@gmail.com', matchLevel: 'none', matchedWords: [] }, displayName: { value: 'memi dev', matchLevel: 'none', matchedWords: [] }, category: { value: 'test', matchLevel: 'none', matchedWords: [] }, tags: [{ value: 'vue', matchLevel: 'none', matchedWords: [] }, { value: 'firebase', matchLevel: 'none', matchedWords: [] }, { value: 'test', matchLevel: 'none', matchedWords: [] }] } },
        //     { boardId: 'new', articleId: '1597120146025', readCount: 11, commentCount: 1, likeCount: 3, createdAt: '2020-08-11T04:29:51.369Z', title: '트럼프 브리핑 시작 3분만에 끼어든 경호원 "나가셔야 합니다"', content: '(워싱턴=연합뉴스) 백나리 특파원 = 10일(현지시간) 오후 백악관 브리핑룸에서 열린 도널드 트럼프 미국 대통령의 브리핑은 여느 때와 별다른 점이 없었다.\n트럼프 대통령은 연단에 서서 준비해온 서류를 단상에 펼쳐놓고 우편투표의 문제점과 관련해 모두 발언을 시작했고 발언이 끝나면 취재진과의 질의응답이 이어질 예정이었다.\n상황은 3분여만에 급변했다. 브리핑룸 문 앞에 서 있던 비밀경호국(SS) 요원이 갑자기 단상 위로 올라와 취재진을 등지고 트럼프 대통령에게 낮은 목소리로 "지금 밖으로 나가셔야 한다"고 말한 것이다.\n트럼프 대통령도  ...', email: 'fkkmemi@gmail.com', displayName: 'memi dev', category: 'test', tags: ['aaa', 'abcd', 'vue', 'news'], objectID: '31545751', _highlightResult: { boardId: { value: 'new', matchLevel: 'none', matchedWords: [] }, articleId: { value: '1597120146025', matchLevel: 'none', matchedWords: [] }, createdAt: { value: '2020-08-11T04:29:51.369Z', matchLevel: 'none', matchedWords: [] }, title: { value: '트럼프 브리핑 시작 3분만에 끼어든 경호원 "나가셔야 합니다"', matchLevel: 'none', matchedWords: [] }, content: { value: '(워싱턴=연합<em>뉴스</em>) 백나리 특파원 = 10일(현지시간) 오후 백악관 브리핑룸에서 열린 도널드 트럼프 미국 대통령의 브리핑은 여느 때와 별다른 점이 없었다.\n트럼프 대통령은 연단에 서서 준비해온 서류를 단상에 펼쳐놓고 우편투표의 문제점과 관련해 모두 발언을 시작했고 발언이 끝나면 취재진과의 질의응답이 이어질 예정이었다.\n상황은 3분여만에 급변했다. 브리핑룸 문 앞에 서 있던 비밀경호국(SS) 요원이 갑자기 단상 위로 올라와 취재진을 등지고 트럼프 대통령에게 낮은 목소리로 "지금 밖으로 나가셔야 한다"고 말한 것이다.\n트럼프 대통령도  ...', matchLevel: 'full', fullyHighlighted: false, matchedWords: ['뉴', '스'] }, email: { value: 'fkkmemi@gmail.com', matchLevel: 'none', matchedWords: [] }, displayName: { value: 'memi dev', matchLevel: 'none', matchedWords: [] }, category: { value: 'test', matchLevel: 'none', matchedWords: [] }, tags: [{ value: 'aaa', matchLevel: 'none', matchedWords: [] }, { value: 'abcd', matchLevel: 'none', matchedWords: [] }, { value: 'vue', matchLevel: 'none', matchedWords: [] }, { value: 'news', matchLevel: 'none', matchedWords: [] }] } }
        //   ],
        //   nbHits: 2,
        //   page: 0,
        //   nbPages: 1,
        //   hitsPerPage: 20,
        //   exhaustiveNbHits: true,
        //   query: '뉴스',
        //   params: 'query=%EB%89%B4%EC%8A%A4',
        //   processingTimeMS: 1
        // }
        // console.log(JSON.stringify(this.result, 2, null))
      } finally {
        this.loaded = true
      }
    }
  }
}
</script>
