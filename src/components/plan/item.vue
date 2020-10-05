<template>
  <v-container v-if="!loaded" fluid>
    <v-skeleton-loader type="article" v-for="i in 4" :key="i"></v-skeleton-loader>
  </v-container>
  <v-container fluid :class="xs ? 'pa-0' : ''" v-else>
    <v-card outlined :tile="xs">
      <v-toolbar color="transparent" dense flat>
        <v-toolbar-title>
          <span v-if="!editable">{{plan.title}}</span>
          <v-text-field
            v-else
            v-model="plan.title"
            dense
            hide-details
            outlined
            label="제목"
            single-line/>
        </v-toolbar-title>
        <v-spacer/>
        <v-btn @click="editable=!editable" icon>
          <v-icon v-text="editable ?  'mdi-eye' : 'mdi-pencil'"/>
        </v-btn>
        <v-btn v-if="editable" @click="save" icon>
          <v-icon v-text="'mdi-content-save'"/>
        </v-btn>
      </v-toolbar>
      <v-divider/>
      <v-card-text>
        <v-timeline :dense="$vuetify.breakpoint.smAndDown">
          <v-timeline-item
            v-for="(item, i) in plan.items"
            :key="i">
            <v-card v-if="!editable">
              <v-toolbar color="accent" dark dense flat>
                <v-toolbar-title>
                {{item.title}}
                </v-toolbar-title>
              </v-toolbar>
              <v-card-subtitle>
                <display-time :time="$moment(item.date).utcOffset(9)"/>
              </v-card-subtitle>
              <v-card-text>
                {{item.description}}
              </v-card-text>
            </v-card>
            <v-card v-else>
              <v-toolbar color="accent" dark dense flat>
                <v-toolbar-title>
                  <v-text-field
                    v-model="item.title"
                    dense
                    hide-details
                    outlined
                    label="제목"
                    single-line/>
                </v-toolbar-title>
                <v-spacer/>
                <!-- <v-btn icon @click="save">
                  <v-icon>mdi-plus</v-icon>
                </v-btn> -->
              </v-toolbar>
              <v-card-text>
                <v-menu
                  v-model="item.menu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="item.date"
                      label="날짜"
                      prepend-inner-icon="mdi-calendar"
                      readonly
                      dense hide-details outlined
                      class="mb-4"
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="item.date"
                    @input="item.menu = false"
                  ></v-date-picker>
                </v-menu>
                <v-textarea
                  v-model="item.description"
                  dense
                  hide-details
                  outlined
                  label="내용"
                  auto-grow rows="2"></v-textarea>
              </v-card-text>

            </v-card>
          </v-timeline-item>
          <v-timeline-item v-if="editable">
            <v-card>
              <v-toolbar color="accent" dark dense flat>
                <v-toolbar-title>
                  <v-text-field
                    v-model="form.title"
                    dense
                    hide-details
                    outlined
                    label="제목"
                    single-line/>
                </v-toolbar-title>
                <v-spacer/>
                <v-btn icon @click="add">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-toolbar>
              <v-card-text>
                <v-menu
                  v-model="menu"
                  :close-on-content-click="false"
                  :nudge-right="40"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="form.date"
                      label="날짜"
                      prepend-inner-icon="mdi-calendar"
                      readonly
                      dense hide-details outlined
                      class="mb-4"
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="form.date"
                    @input="menu = false"
                  ></v-date-picker>
                </v-menu>
                <v-textarea
                  v-model="form.description"
                  dense
                  hide-details
                  outlined
                  label="내용"
                  auto-grow rows="2"></v-textarea>
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
      loaded: false,
      exists: false,
      ref: this.$firebase.firestore().collection('plans').doc(this.id),
      editable: false,
      // plan: {
      //   items: [
      //     { time: new Date(), title: 'hihi', description: 'abcd' },
      //     { time: this.$moment().add(3, 'days').toDate(), title: 'hihi2', description: 'abcd3' },
      //     { time: this.$moment().add(4, 'days').toDate(), title: 'hihi3', description: 'abcd3' }
      //   ],
      //   description: 'hi',
      //   uid: null
      // },
      plan: {
        title: '',
        description: '',
        items: []
      },
      menu: false,
      form: {
        date: this.$moment().format('YYYY-MM-DD'),
        title: '',
        description: '',
        active: false
      }
    }
  },
  computed: {
    xs () {
      return this.$vuetify.breakpoint.xs
    },
    user () {
      return this.$store.state.user
    }
  },
  mounted () {
    this.fetch()
  },
  methods: {
    async fetch () {
      try {
        const doc = await this.ref.get()
        this.exists = doc.exists
        if (!this.exists) return
        const plan = doc.data()
        plan.items.forEach(item => {
          item.menu = false
        })
        plan.createdAt = plan.createdAt.toDate()
        this.plan = plan
      } finally {
        this.loaded = true
      }
    },
    async add () {
      if (!this.form.title || !this.form.description) throw Error('제목과 내용은 필수 입력입니다')

      this.plan.items.push(this.form)
      this.form = { date: this.$moment().format('YYYY-MM-DD'), title: '', description: '' }
    },
    async save () {
      const doc = {
        title: this.plan.title,
        description: this.plan.description,
        updatedAt: new Date(),
        items: [],
        uid: this.user.uid,
        level: this.user.level
      }
      this.plan.items.forEach(v => {
        const item = {
          title: v.title,
          description: v.description,
          date: v.date
        }
        doc.items.push(item)
      })
      if (!this.exists) doc.createdAt = new Date()
      this.ref.set(doc)
    }
  }
}
</script>
