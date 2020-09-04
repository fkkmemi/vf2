<template>
  <v-card flat>
    <v-list-item>
      <v-list-item-icon>
        <v-icon>mdi-palette</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>색상 변경</v-list-item-title>
        <v-list-item-subtitle>전체 색상을 변경합니다</v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-action>
        <v-btn @click="restore" icon>
          <v-icon>mdi-restore</v-icon>
        </v-btn>
      </v-list-item-action>
      <v-list-item-action>
        <v-btn @click="show=!show" icon>
          <v-icon v-text="show ? 'mdi-chevron-up' : 'mdi-chevron-down'"/>
        </v-btn>
      </v-list-item-action>
    </v-list-item>
    <v-divider v-show="show"/>
    <v-card-text v-show="show">
      <v-alert dismissible border="left" type="warning">
        주의: 색상을 잘못 지정하면 글이 안보일 수 있습니다
      </v-alert>
      <v-row>
        <v-col cols="12" sm="6">
          <v-card outlined>
            <v-card-title class="body-2">색상</v-card-title>
            <v-divider/>
            <template v-for="(item, i) in items">
              <v-card flat :key="i" v-show="$vuetify.theme.dark ? item.type === 'dark' : item.type === 'light'">
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>{{item.name}}</v-list-item-title>
                    <v-list-item-subtitle>{{themeDescriptionFromName(item.name)}}</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn @click="restoreItem(item)" icon>
                      <v-icon>mdi-restore</v-icon>
                    </v-btn>
                  </v-list-item-action>
                  <v-list-item-action>
                    <v-btn @click="save(item)" icon>
                      <v-icon>mdi-content-save</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
                <div class="d-flex justify-center">
                  <v-color-picker
                    v-model="item.value"
                    class="ma-2"
                    show-swatches
                    mode="hexa"
                  />
                </div>
              </v-card>
              <v-divider :key="i + 100" v-if="i < items.length -1 "  v-show="$vuetify.theme.dark ? item.type === 'dark' : item.type === 'light'"/>
            </template>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6">
          <v-card outlined v-for="i in ($vuetify.breakpoint.xs ? 1 : 5)" :key="i" class="mb-4">
            <v-card-title class="body-2">샘플 {{i}}</v-card-title>
            <v-divider/>

            <v-subheader>text</v-subheader>
            <v-card-text>
              <v-card-title class=" body-1 d-flex align-center">
                <v-icon left color="success">mdi-bell-ring</v-icon>
                <v-icon left color="warning">mdi-alert-circle</v-icon>
                <v-icon color="error" left>mdi-fire</v-icon>
                <span class="text--primary mr-5">제목</span>
                <span class="text--secondary">읽은 제목</span>
              </v-card-title>
              <v-card-text class="text--primary">
                <viewer :class="$vuetify.theme.dark ? 'tui-dark' : null" :initialValue="content"></viewer>
              </v-card-text>
              <v-chip color="primary" class="ma-2">category</v-chip>
              <v-chip color="primary" outlined label small class="ma-2">category</v-chip>
              <v-chip color="info" class="ma-2">tag</v-chip>
              <v-chip color="info" outlined label small class="ma-2">tag</v-chip>
              <v-chip color="accent" class="ma-2">
                <v-avatar left><v-img src="/logo-circle.png"></v-img></v-avatar>user
              </v-chip>
              <v-chip color="accent" outlined small class="ma-2">user</v-chip>
              <v-btn rounded color="success">
                <v-icon left>mdi-thumb-up-outline</v-icon>
                좋아요
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
import constants from '@/util/constants'

export default {
  data () {
    return {
      show: true, // false,
      items: [],
      content: ''

    }
  },
  created () {
    this.makeContent()
    this.read()
  },
  methods: {
    makeContent () {
      let text =
`# 제목
내용입니다.
## 서브내용
서브내용입니다.
**test.vue**
`
      text +=
'```vue'
      text +=
`
<template>
  <v-card>코드입니다</v-card>
</template>
<script>
import _ from 'lodash'
`
      text +=
'```'
      this.content = text
    },
    read () {
      for (const type of Object.keys(this.$vuetify.theme.themes)) {
        for (const [name, value] of Object.entries(this.$vuetify.theme.themes[type])) {
          const findItem = this.items.find(item => item.type === type && item.name === name)
          if (!findItem) {
            this.items.push({
              type: type,
              name: name,
              value: value
            })
          } else findItem.value = value
        }
      }
    },
    save (item) {
      this.$vuetify.theme.themes[item.type][item.name] = item.value
      localStorage.setItem('site-themes', JSON.stringify(this.$vuetify.theme.themes))
    },
    restoreItem (item) {
      this.$vuetify.theme.themes[item.type][item.name] = constants.themes[item.type][item.name]
      localStorage.setItem('site-themes', JSON.stringify(this.$vuetify.theme.themes))
      this.read()
    },
    restore () {
      for (const type of Object.keys(this.$vuetify.theme.themes)) {
        for (const [name] of Object.entries(this.$vuetify.theme.themes[type])) {
          this.$vuetify.theme.themes[type][name] = constants.themes[type][name]
        }
      }
      // this.$vuetify.theme.themes = constants.themes 안됨...
      localStorage.setItem('site-themes', JSON.stringify(this.$vuetify.theme.themes))
      this.read()
    },
    themeDescriptionFromName (name) {
      return constants.themeDescription[name]
    }
  }
}
</script>
