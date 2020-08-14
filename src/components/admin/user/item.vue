<template>
  <v-card class="ma-4">
    <v-list-item>
      <v-list-item-avatar>
        <v-img :src="item.photoURL"/>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>
          {{ item.displayName }}
          <span v-if="!item.emailVerified">
            <v-icon small right>mdi-alert</v-icon>
            이메일 인증 안됨
          </span>
          <span class="caption">({{ levels[item.level].text }})</span>
        </v-list-item-title>
        <v-list-item-subtitle>
          <v-icon v-if="item.providerId === 'google.com'" small left color="#dd4b39">
            mdi-google
          </v-icon>
          <v-icon v-if="item.providerId === 'password'" small left color="primary">
            mdi-email
          </v-icon>
          {{item.email}}
        </v-list-item-subtitle>
        <v-list-item-subtitle class="caption">
          방문일: <display-time :time="item.visitedAt"/> |
          수정일: <display-time :time="item.updatedAt"/> |
          가입일: <display-time :time="item.createdAt"/>
        </v-list-item-subtitle>
        <!-- <v-list-item-subtitle class="caption">
          수정일: <display-time :time="item.updatedAt"/>
        </v-list-item-subtitle>
        <v-list-item-subtitle class="caption">
          방문일: <display-time :time="item.visitedAt"/>
        </v-list-item-subtitle> -->
      </v-list-item-content>
      <!-- <v-list-item-action>
        <v-select :items="levels" v-model="level" outlined label="권한" />
      </v-list-item-action> -->
      <v-list-item-action>
        <v-dialog v-model="dialog" max-width="300">
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              v-on="on">
              <v-icon>mdi-cog</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-subheader>
              {{item.email}} 수정
              <v-spacer/>
              <v-btn @click="dialog=!dialog" icon><v-icon small>mdi-close</v-icon></v-btn>
            </v-subheader>
            <v-divider />
            <v-card-text class="mt-4 mb-0">
              <v-select
                :items="levels"
                v-model="level"
                @change="save"
                outlined
                label="권한 변경"
                hide-details />
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-list-item-action>
    </v-list-item>
  </v-card>
</template>
<script>
import DisplayTime from '@/components/display-time'
import constants from '@/util/constants'

export default {
  components: { DisplayTime },
  props: ['item'],
  data () {
    return {
      levels: constants.levels,
      level: this.item.level,
      dialog: false
    }
  },
  methods: {
    async save () {
      if (this.item.level === this.level) throw Error('변경 사항이 없습니다')
      const r = await this.$swal.fire({
        title: '정말 변경하시겠습니까?',
        icon: 'warning',
        // confirmButtonText: 'Cool',
        showCancelButton: true
      })
      if (!r.value) return
      const set = {
        updatedAt: new Date(),
        level: this.level
      }
      await this.$firebase.firestore()
        .collection('users').doc(this.item.id)
        .update(set)
      this.dialog = false
    }
  }
}
</script>
