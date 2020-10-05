<template>
  <v-container fluid :class="xs ? 'pa-0' : ''">
    <v-card outlined :tile="xs">
      <v-toolbar color="transparent" dense flat>
        <v-toolbar-title>
          {{id}}
        </v-toolbar-title>
      </v-toolbar>
      <v-divider/>
      <v-card-text>
        <v-timeline :dense="$vuetify.breakpoint.smAndDown">
          <v-timeline-item
            v-for="(item, i) in plan.items"
            :key="i">
            <v-card>
              <v-toolbar color="accent" dark dense flat>
                <v-toolbar-title>
                {{item.title}}
                </v-toolbar-title>
              </v-toolbar>
              <v-card-subtitle>
                <display-time :time="item.time"/>
              </v-card-subtitle>
              <v-card-text>
                {{item.description}}
              </v-card-text>
            </v-card>
          </v-timeline-item>
          <v-timeline-item>
            <v-card>
              <v-toolbar color="accent" dark dense flat>
                <v-toolbar-title>
                  <v-text-field dense hide-details outlined label="제목" single-line></v-text-field>
                </v-toolbar-title>
                <v-spacer/>
                <v-btn icon>
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-toolbar>
              <v-card-text>
                <v-text-field dense hide-details outlined label="날짜" class="mb-4"></v-text-field>
                <v-textarea dense hide-details outlined label="내용" auto-grow rows="2"></v-textarea>
              </v-card-text>
            </v-card>
          </v-timeline-item>

        </v-timeline>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script>
import DisplayTime from '@/components/display-time'

export default {
  components: { DisplayTime },
  props: ['id'],
  data () {
    return {
      ref: this.$firebase.firestore().collection('plans').doc(this.id),
      plan: {
        items: [
          { time: new Date(), title: 'hihi', description: 'abcd' },
          { time: this.$moment().add(3, 'days').toDate(), title: 'hihi2', description: 'abcd3' },
          { time: this.$moment().add(4, 'days').toDate(), title: 'hihi3', description: 'abcd3' }
        ],
        description: 'hi',
        uid: null
      }
    }
  },
  computed: {
    xs () {
      return this.$vuetify.breakpoint.xs
    }
  },
  mounted () {

  },
  methods: {
    async fetch () {

    }
  }
}
</script>
