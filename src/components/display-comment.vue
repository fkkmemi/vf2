<template>
  <v-card>
    <v-card-title>
      <v-text-field v-model="comment" outlined label="댓글 작성" @keypress.enter="save" hide-details></v-text-field>
    </v-card-title>
  </v-card>
</template>
<script>
export default {
  props: ['docRef'],
  data () {
    return {
      comment: ''
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  methods: {
    async save () {
      const doc = {
        createdAt: new Date(),
        updatedAt: new Date(),
        comment: this.comment,
        uid: this.$store.state.fireUser.uid,
        user: {
          email: this.user.email,
          photoURL: this.user.photoURL,
          displayName: this.user.displayName
        }
      }
      const id = doc.createdAt.getTime().toString()
      const batch = this.$firebase.firestore().batch()
      batch.update(this.docRef, { commentCount: this.$firebase.firestore.FieldValue.increment(1) })
      batch.set(this.docRef.collection('comments').doc(id), doc)
      await batch.commit()
      this.comment = ''
    }
  }
}
</script>
