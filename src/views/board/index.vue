<template>
  <v-card>
    <v-card-title>board test</v-card-title>
    <v-card-actions>
      <v-btn @click="read"><v-icon left>mdi-page-next</v-icon></v-btn>
      <v-btn @click="openDialog"><v-icon left>mdi-pencil</v-icon></v-btn>
    </v-card-actions>
    <v-dialog max-width="500" v-model="dialog">
      <v-card>
        <v-form>
          <v-card-text>
              <v-text-field v-model="form.title"></v-text-field>
              <v-text-field v-model="form.content"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer/>
            <v-btn @click="save">save</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </v-card>
</template>
<script>
export default {
  data () {
    return {
      items: [],
      form: {
        title: '',
        content: ''
      },
      dialog: false
    }
  },
  methods: {
    openDialog () {
      this.dialog = true
    },
    save () {
      this.$firebase.firestore().collection('boards').add(this.form)
      this.dialog = false
    },
    async read () {
      const sn = await this.$firebase.firestore().collection('boards').get()
      // if (sn.)
      this.items = sn.docs.map(v => {
        const item = v.data()
        return {
          id: v.id, title: item.title, content: item.content
        }
      })
      console.log(this.items)
    }

  }
}
</script>
