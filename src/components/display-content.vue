<template>
  <v-card>
    <v-toolbar color="primary" dark>
      <v-toolbar-title>
        {{item.title}}
      </v-toolbar-title>
      <v-spacer/>
      <v-btn @click="articleWrite" icon><v-icon>mdi-pencil</v-icon></v-btn>
      <v-btn @click="remove" icon><v-icon>mdi-delete</v-icon></v-btn>
      <v-btn @click="$emit('close')" icon><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>
    <v-card-text >
      <viewer v-if="content" :initialValue="content"></viewer>
      <v-container v-else>
        <v-row justify="center" align="center">
          <v-progress-circular indeterminate></v-progress-circular>
        </v-row>
      </v-container>
    </v-card-text>
    <v-card-actions>
      <v-spacer/>
      <span class="font-italic caption">
        작성일: <display-time :time="item.createdAt"></display-time>
      </span>
    </v-card-actions>
    <v-card-actions>
      <v-spacer/>
      <span class="font-italic caption">
        수정일: <display-time :time="item.updatedAt"></display-time>
      </span>
    </v-card-actions>
    <v-divider/>
    <display-comment :article="item" :docRef="this.ref.collection('articles').doc(this.item.id)"></display-comment>
  </v-card>
</template>
<script>
import axios from 'axios'
import DisplayTime from '@/components/display-time'
import DisplayComment from '@/components/display-comment'

export default {
  components: { DisplayTime, DisplayComment },
  props: ['document', 'item'],
  data () {
    return {
      content: '',
      ref: this.$firebase.firestore().collection('boards').doc(this.document)
    }
  },
  mounted () {
    this.fetch()
  },
  methods: {
    async fetch () {
      const r = await axios.get(this.item.url)
      this.content = typeof r.data === 'string' ? r.data : r.data.toString()
      // this.content = typeof r.data === 'string' ? r.data : r.data.toString()
      await this.ref.collection('articles').doc(this.item.id)
        .update({
          readCount: this.$firebase.firestore.FieldValue.increment(1)
        })
    },
    async articleWrite () {
      this.$router.push({ path: this.$route.path + '/article-write', query: { articleId: this.item.id } })
    },
    async remove () {
      // const batch = this.$firebase.firestore().batch()
      // batch.update(this.ref, { count: this.$firebase.firestore.FieldValue.increment(-1) })
      // batch.delete(this.ref.collection('articles').doc(this.item.id))
      // await batch.commit()
      // await this.$firebase.storage().ref().child('boards').child(this.document).child(this.$store.state.fireUser.uid).child(this.item.id + '.md').delete()
      this.ref.collection('articles').doc(this.item.id).delete()
      this.$emit('close')
    }
  }
}
</script>
