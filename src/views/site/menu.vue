<template>
  <div>
    <v-list-item three-line>
      <v-list-item-content>
        <v-list-item-title class="title">
          Menu
        </v-list-item-title>
        <v-list-item-subtitle>
          0.0.1
        </v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-action>
        <v-btn @click="$store.commit('setEdit', !$store.state.editable)" icon>
          <v-icon v-text="$store.state.editable ? 'mdi-eye' : 'mdi-pencil'"></v-icon>
        </v-btn>
      </v-list-item-action>
      <v-list-item-action>
        <v-btn @click="$emit('close')" icon>
          <v-icon>mdi-close</v-icon>
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
        :no-action="!$store.state.editable"
      >
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title>
              {{ item.title }}
              <span v-if="$store.state.editable">
                <v-btn icon @click="openDialogItem(i)"><v-icon>mdi-pencil</v-icon></v-btn>
                <v-btn icon @click="moveItem(items, i, -1)" v-if="i > 0"><v-icon>mdi-chevron-double-up</v-icon></v-btn>
                <v-btn icon @click="moveItem(items, i, 1)" v-if="i < items.length - 1"><v-icon>mdi-chevron-double-down</v-icon></v-btn>
                <v-btn icon @click="removeItem(items, i)"><v-icon>mdi-delete</v-icon></v-btn>
              </span>
            </v-list-item-title>
          </v-list-item-content>
        </template>

        <v-list-item
          v-for="(subItem, j) in item.subItems"
          :key="j"
          :to="$store.state.editable ? null : subItem.to"
          exact
        >
          <v-list-item-content>
            <v-list-item-title :class="$store.state.editable ? 'pl-4':''">
              {{ subItem.title }}
              <span v-if="$store.state.editable">
                <v-btn icon @click="openDialogSubItem(i, j)"><v-icon>mdi-pencil</v-icon></v-btn>
                <v-btn icon @click="moveItem(item.subItems, j, -1)" v-if="j > 0"><v-icon>mdi-chevron-double-up</v-icon></v-btn>
                <v-btn icon @click="moveItem(item.subItems, j, 1)" v-if="j < item.subItems.length - 1"><v-icon>mdi-chevron-double-down</v-icon></v-btn>
                <v-btn icon @click="removeItem(item.subItems, j)"><v-icon>mdi-delete</v-icon></v-btn>
              </span>
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
            <v-list-item-title>추가하기</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-group>
      <v-list-item @click="openDialogItem(-1)" v-if="$store.state.editable">
        <v-list-item-icon><v-icon>mdi-plus</v-icon></v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>추가하기</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-dialog v-model="dialogItem" max-width="400">
      <v-card>
        <v-card-title>
          메인 아이템 수정
          <v-spacer/>
          <v-btn @click="saveItem" icon color="success"><v-icon>mdi-content-save</v-icon></v-btn>
          <v-btn @click="dialogItem=false" icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="2">
              <v-icon v-text="formItem.icon" required></v-icon>
            </v-col>
            <v-col cols="10">
              <v-text-field
                v-model="formItem.icon"
                label="mdi icon"
                outlined
                clearable
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-text-field v-model="formItem.title" label="아이템 이름" outlined hide-details></v-text-field>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogSubItem" max-width="400">
      <v-card>
        <v-card-title>
          서브 아이템 수정
          <v-spacer/>
          <v-btn @click="saveSubItem" icon color=""><v-icon>mdi-content-save</v-icon></v-btn>
          <v-btn @click="dialogSubItem=false" icon><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="formSubItem.title" label="메뉴 이름" outlined required></v-text-field>
          <v-text-field v-model="formSubItem.to" label="경로" outlined required></v-text-field>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
export default {
  props: ['items'],
  data () {
    return {
      loading: false,
      dialogItem: false,
      dialogSubItem: false,
      selectedItemIndex: 0,
      selectedSubItemIndex: 0,
      formItem: {
        icon: 'mdi-crosshairs-question',
        title: ''
      },
      formSubItem: {
        title: '',
        to: ''
      }
    }
  },
  methods: {
    async save () {
      try {
        this.loading = true
        await this.$firebase.database().ref().child('site').child('menu').set(this.items)
      } finally {
        this.dialogItem = false
        this.dialogSubItem = false
        this.loading = false
      }
    },
    openDialogItem (index) {
      this.selectedItemIndex = index
      if (index < 0) {
        this.formItem.icon = 'mdi-crosshairs-question'
        this.formItem.title = ''
      } else {
        this.formItem.icon = this.items[index].icon
        this.formItem.title = this.items[index].title
      }
      this.dialogItem = true
    },
    async saveItem () {
      if (this.selectedItemIndex < 0) this.items.push(this.formItem)
      else {
        this.items[this.selectedItemIndex].icon = this.formItem.icon
        this.items[this.selectedItemIndex].title = this.formItem.title
      }
      this.save()
    },
    openDialogSubItem (index, subIndex) {
      this.selectedItemIndex = index
      this.selectedSubItemIndex = subIndex
      if (subIndex < 0) {
        this.formSubItem.title = ''
        this.formSubItem.to = ''
      } else {
        this.formSubItem.title = this.items[index].subItems[subIndex].title
        this.formSubItem.to = this.items[index].subItems[subIndex].to
      }
      this.dialogSubItem = true
    },
    async saveSubItem () {
      if (this.selectedSubItemIndex < 0) {
        if (!this.items[this.selectedItemIndex].subItems) this.items[this.selectedItemIndex].subItems = []
        this.items[this.selectedItemIndex].subItems.push({ title: this.formSubItem.title, to: this.formSubItem.to })
      } else {
        this.items[this.selectedItemIndex].subItems[this.selectedSubItemIndex].title = this.formSubItem.title
        this.items[this.selectedItemIndex].subItems[this.selectedSubItemIndex].to = this.formSubItem.to
      }
      this.save()
    },
    moveItem (items, i, arrow) {
      // const item = items.splice(i, 1)[0]
      // items.splice(i + arrow, 0, item)
      items.splice(i + arrow, 0, ...items.splice(i, 1))
      this.save()
    },
    async removeItem (items, i) {
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
