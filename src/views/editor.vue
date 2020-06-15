<template>
  <v-sheet>
    <v-subheader>
      editor
      <v-spacer/>
      <v-btn @click="toggle=!toggle">toggle</v-btn>
      <v-btn @click="read">read</v-btn>
    </v-subheader>
    <editor :options="options" :initialValue="text" ref="editor"></editor>
    <viewer v-if="toggle" :initialValue="text"></viewer>
  </v-sheet>
</template>
<script>
export default {
  data () {
    return {
      options: {
        language: 'ko'
      },
      text: '# abcdefg',
      toggle: false
    }
  },
  methods: {
    read () {
      this.text = this.$refs.editor.invoke('getMarkdown')
      alert(this.$refs.editor.invoke('getMarkdown'))
    }
  }
}
</script>
