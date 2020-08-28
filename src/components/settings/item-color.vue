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
          <v-icon left>mdi-restore</v-icon>
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
        <template v-for="(item, i) in items">
          <v-col cols="12" sm="6" md="4" lg="3" :key="i" v-show="$vuetify.theme.dark ? item.type === 'dark' : item.type === 'light'">
            <v-card outlined >
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
                  width="274"
                  mode="hexa"
                />
              </div>
            </v-card>
          </v-col>
        </template>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
import constants from '@/util/constants'

export default {
  data () {
    return {
      show: false,
      items: []
    }
  },
  created () {
    this.read()
  },
  methods: {
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
