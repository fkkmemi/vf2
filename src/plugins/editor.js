import Vue from 'vue'
import 'codemirror/lib/codemirror.css'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'
import '@toast-ui/editor/dist/i18n/ko-kr'

import { Editor, Viewer } from '@toast-ui/vue-editor'
Vue.component('editor', Editor)
Vue.component('viewer', Viewer)
