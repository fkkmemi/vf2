import Vue from 'vue'
import moment from 'moment'
// import 'moment/locale/ko'

moment.locale('ko')

Vue.prototype.$moment = moment
