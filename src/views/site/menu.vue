<template>
  <div>
    <v-list-item>
      <v-list-item-avatar>
        <v-img contain :src="$vuetify.theme.dark ? '/logo-circle-dark.png' : '/logo-circle.png'"></v-img>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title class="font-weight-medium primary--text">
          {{site.title}}
        </v-list-item-title>
        <v-list-item-subtitle class="caption">
          {{version}}
        </v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-action>
        <v-btn @click="$emit('close')" icon>
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>
    <v-divider></v-divider>

    <v-list nav>
      <v-list-group
        v-for="(item, i) in items"
        :key="i"
        v-model="item.active"
        :prepend-icon="item.icon"
        :no-action="false"
        v-show="(item.level >= 5) || (user && user.level <= item.level)"
      >
        <!-- :no-action="!$store.state.editable" -->
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title class="d-flex align-center">
              <v-icon color="error" left v-if="newCheck(new Date(item.createdAt), 'days', 1)">mdi-fire</v-icon>
              <span class="subtitle-1 font-weight-regular text-truncate mr-2">{{ item.title }}</span>
              <template v-if="$store.state.editable">
                <v-btn icon @click.stop="openDialogItem(i)" small><v-icon small>mdi-pencil</v-icon></v-btn>
                <v-btn icon @click.stop="moveItem(items, i, -1)" v-if="i > 0" small> <v-icon small>mdi-chevron-double-up</v-icon></v-btn>
                <v-btn icon @click.stop="moveItem(items, i, 1)" v-if="i < items.length - 1" small><v-icon small>mdi-chevron-double-down</v-icon></v-btn>
                <v-btn icon @click.stop="removeItem(items, i)" small><v-icon small>mdi-delete</v-icon></v-btn>
              </template>
            </v-list-item-title>
          </v-list-item-content>
          <!-- <v-list-item-content>
            <template v-if="$store.state.editable">
              <v-btn icon @click.stop="openDialogItem(i)" small><v-icon small>mdi-pencil</v-icon></v-btn>
              <v-btn icon @click.stop="moveItem(items, i, -1)" v-if="i > 0" small> <v-icon small>mdi-chevron-double-up</v-icon></v-btn>
              <v-btn icon @click.stop="moveItem(items, i, 1)" v-if="i < items.length - 1" small><v-icon small>mdi-chevron-double-down</v-icon></v-btn>
              <v-btn icon @click.stop="removeItem(items, i)" small><v-icon small>mdi-delete</v-icon></v-btn>
            </template>
          </v-list-item-content> -->
        </template>

        <v-list-item
          v-for="(subItem, j) in item.subItems"
          :key="j"
          :to="$store.state.editable ? null : subItem.to"
          exact
          v-show="(item.level >= 5) || (user && user.level <= item.level)"
          dense
        >
          <v-list-item-content>
            <v-list-item-title class="d-flex align-center pl-6">
              <v-icon color="error" left v-if="newCheck(new Date(subItem.createdAt), 'days', 1)">mdi-fire</v-icon>
              <span class="subtitle-2 font-weight-regular text-truncate">{{ subItem.title }}</span>
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-content v-if="$store.state.editable">
            <v-list-item-title>
              <v-btn icon @click.stop="openDialogSubItem(i, j)" small><v-icon small>mdi-pencil</v-icon></v-btn>
              <v-btn icon @click.stop="moveItem(item.subItems, j, -1)" v-if="j > 0" small><v-icon small>mdi-chevron-double-up</v-icon></v-btn>
              <v-btn icon @click.stop="moveItem(item.subItems, j, 1)" v-if="j < item.subItems.length - 1" small><v-icon small>mdi-chevron-double-down</v-icon></v-btn>
              <v-btn icon @click.stop="removeItem(item.subItems, j)" small><v-icon small>mdi-delete</v-icon></v-btn>
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action v-if="$store.state.editable">
            <v-btn icon :to="subItem.to" exact><v-icon>mdi-arrow-right-bold-circle-outline</v-icon></v-btn>
          </v-list-item-action>
        </v-list-item>
        <v-list-item @click="openDialogSubItem(i, -1)" v-if="$store.state.editable">
          <v-list-item-icon :class="$store.state.editable ? 'pl-4':''">
            <v-icon>mdi-plus</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>소메뉴 추가하기</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-group>
      <v-list-item @click="openDialogItem(-1)" v-if="$store.state.editable">
        <v-list-item-icon><v-icon>mdi-plus</v-icon></v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>대메뉴 추가하기</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-dialog v-model="dialogItem" max-width="400">
      <v-card>
        <v-card-title>
          메인 아이템 수정
          <v-spacer/>
          <v-btn @click="saveItem" icon color=""><v-icon small>mdi-content-save</v-icon></v-btn>
          <v-btn @click="dialogItem=false" icon><v-icon small>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider/>
        <v-card-text>
          <v-row>
            <v-col cols="2">
              <v-icon v-text="formItem.icon" x-large required></v-icon>
            </v-col>
            <v-col cols="10">
              <v-text-field
                v-model="formItem.icon"
                label="mdi icon"
                outlined
                clearable
                required
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" lg="4">
              <v-select v-model="formItem.level" :items="levels" label="권한" outlined hide-details prepend-inner-icon="mdi-eye"></v-select>
            </v-col>
            <v-col cols="12" sm="6" lg="8">
              <v-text-field v-model="formItem.title" label="아이템 이름" outlined hide-details clearable></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="font-italic caption mr-4">
          <v-spacer/>
          <span class="mr-2">최종 수정일:</span>
          <display-time :time="new Date(formItem.createdAt)"/>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogSubItem" max-width="400">
      <v-card>
        <v-card-title>
          서브 아이템 수정
          <v-spacer/>
          <v-btn @click="saveSubItem" icon color=""><v-icon small>mdi-content-save</v-icon></v-btn>
          <v-btn @click="dialogSubItem=false" icon><v-icon small>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider/>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6" lg="4">
              <v-select v-model="formSubItem.level" :items="levels" label="권한" outlined hide-details prepend-inner-icon="mdi-eye"></v-select>
            </v-col>
            <v-col cols="12" sm="6" lg="8">
              <v-text-field v-model="formSubItem.title" label="메뉴 이름" outlined required clearable hide-details></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="formSubItem.to" label="경로" outlined required clearable hide-details></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="font-italic caption mr-4">
          <v-spacer/>
          <span class="mr-2">최종 수정일:</span>
          <display-time :time="new Date(formSubItem.createdAt)"/>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { version } from '../../../package.json'
import site from '../../../siteConfig'
import DisplayTime from '@/components/display-time'
import newCheck from '@/util/newCheck'
import constants from '@/util/constants'

export default {
  components: { DisplayTime },
  props: ['items'],
  data () {
    return {
      site,
      version,
      newCheck,
      loading: false,
      dialogItem: false,
      dialogSubItem: false,
      selectedItemIndex: 0,
      selectedSubItemIndex: 0,
      formItem: {
        icon: 'mdi-help',
        title: '',
        createdAt: new Date().getTime(),
        level: 5
      },
      formSubItem: {
        title: '',
        to: '',
        createdAt: new Date().getTime(),
        level: 5
      },
      // levels: [
      //   { text: '개발자', value: 0 },
      //   { text: '관리자', value: 1 },
      //   { text: '게시판관리자', value: 2 },
      //   { text: '게시판운영자', value: 3 },
      //   { text: '사용자', value: 4 },
      //   { text: '손님', value: 5 }
      // ]
      levels: constants.levels
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    fireUser () {
      return this.$store.state.fireUser
    }
  },
  mounted () {
  },
  methods: {
    authCheck () {
      if (!this.user) throw Error('로그인이 필요합니다')
      if (this.user.level > 1) throw Error('관리 권한이 필요합니다')
    },
    async save () {
      try {
        this.loading = true
        this.items.forEach((item, i) => {
          if (i === 0) item.active = true
          else item.active = false
        })
        await this.$firebase.database().ref().child('site').child('menu').set(this.items)
      } finally {
        this.dialogItem = false
        this.dialogSubItem = false
        this.loading = false
      }
    },
    openDialogItem (index) {
      this.authCheck()

      this.selectedItemIndex = index
      if (index < 0) {
        this.formItem.icon = 'mdi-help'
        this.formItem.title = ''
        this.formItem.level = 5
      } else {
        this.formItem.icon = this.items[index].icon
        this.formItem.title = this.items[index].title
        this.formItem.level = this.items[index].level
      }
      this.dialogItem = true
    },
    async saveItem () {
      this.formItem.createdAt = new Date().getTime()
      if (this.selectedItemIndex < 0) this.items.push(this.formItem)
      else {
        this.items[this.selectedItemIndex].icon = this.formItem.icon
        this.items[this.selectedItemIndex].title = this.formItem.title
        this.items[this.selectedItemIndex].level = this.formItem.level
        this.items[this.selectedItemIndex].createdAt = this.formItem.createdAt
      }
      this.save()
    },
    openDialogSubItem (index, subIndex) {
      this.authCheck()

      this.selectedItemIndex = index
      this.selectedSubItemIndex = subIndex
      if (subIndex < 0) {
        this.formSubItem.title = ''
        this.formSubItem.to = ''
        this.formSubItem.level = 5
      } else {
        this.formSubItem.title = this.items[index].subItems[subIndex].title
        this.formSubItem.to = this.items[index].subItems[subIndex].to
        this.formSubItem.level = this.items[index].subItems[subIndex].level
      }
      this.dialogSubItem = true
    },
    async saveSubItem () {
      this.formSubItem.createdAt = new Date().getTime()
      if (this.selectedSubItemIndex < 0) {
        if (!this.items[this.selectedItemIndex].subItems) this.items[this.selectedItemIndex].subItems = []
        this.items[this.selectedItemIndex].subItems.push({
          title: this.formSubItem.title,
          to: this.formSubItem.to,
          level: this.formSubItem.level,
          createdAt: this.formSubItem.createdAt
        })
      } else {
        this.items[this.selectedItemIndex].subItems[this.selectedSubItemIndex].title = this.formSubItem.title
        this.items[this.selectedItemIndex].subItems[this.selectedSubItemIndex].to = this.formSubItem.to
        this.items[this.selectedItemIndex].subItems[this.selectedSubItemIndex].level = this.formSubItem.level
        this.items[this.selectedItemIndex].subItems[this.selectedSubItemIndex].createdAt = this.formSubItem.createdAt
      }
      this.save()
    },
    moveItem (items, i, arrow) {
      this.authCheck()

      // const item = items.splice(i, 1)[0]
      // items.splice(i + arrow, 0, item)
      items.splice(i + arrow, 0, ...items.splice(i, 1))
      this.save()
    },
    async removeItem (items, i) {
      this.authCheck()

      const r = await this.$swal.fire({
        title: '정말 삭제하시겠습니까?',
        text: '삭제 후 되돌릴 수 없습니다.',
        icon: 'error',
        // confirmButtonText: 'Cool',
        showCancelButton: true
      })
      if (!r.value) return
      items.splice(i, 1)
      this.save()
    }
  }
}
</script>
