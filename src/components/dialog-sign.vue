<template>
  <v-card>
    <v-toolbar dense color="primary" dark flat>
      <v-toolbar-title>
        {{ modeIn ? '로그인' : '회원가입'}}
      </v-toolbar-title>
      <v-spacer/>
      <v-btn text @click="modeIn=!modeIn">
        <v-icon left v-text="modeIn ? 'mdi-account-plus' : 'mdi-account'"></v-icon>
        <span v-text="modeIn ? '회원가입' : '로그인'"></span>
      </v-btn>
      <v-btn icon @click="$emit('close')"><v-icon>mdi-close</v-icon></v-btn>
    </v-toolbar>
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6" :order="$vuetify.breakpoint.xs ? 1 : null">
          <template v-if="modeIn">
            <v-alert color="info" dark border="left" outlined height="100%">
              <p>{{site.title}}({{site.domain}}) 에 오신걸 환영합니다~</p>
              <p>{{site.description}}</p>
            </v-alert>
          </template>
          <template v-else>
            <v-card outlined>
              <v-tabs v-model="signUpTab" grow>
                <v-tab>설명</v-tab>
                <v-tab>이용약관</v-tab>
                <v-tab>개인정보취급방침</v-tab>
              </v-tabs>
              <v-tabs-items v-model="signUpTab">
                <v-tab-item>
                  <v-card-text>
                    <ul class="mt-4 text--primary">
                      <li>소셜 로그인 시 회원가입이 필요 없습니다</li>
                      <li>소셜 가입시 이메일(email), 표시이름(displayName: 실명 아님), 사진(photoURL: 소셜 제공)이 저장됩니다.</li>
                      <li>이메일 가입시 이메일(email)과 표시이름(displayName: 실명 아님)이 저장됩니다.</li>
                      <li>이메일 가입시 메일 확인 후 정상 동작합니다</li>
                      <li>패스워드는 구글 정책(firebase auth)에 의해 암호화되어 저장되며 이 사이트에서는 수집하지 않습니다</li>
                      <li>회원 탈퇴 후 7일 후에 모든 데이터가 삭제됩니다.(재가입 방지)</li>
                      <li>일부 기능은 관리자의 승인 후 사용할 수 있습니다</li>
                    </ul>
                  </v-card-text>
                </v-tab-item>
                <v-tab-item>
                  <terms-content/>
                </v-tab-item>
                <v-tab-item>
                  <privacy-content/>
                </v-tab-item>
              </v-tabs-items>
              <v-card-actions v-if="signUpTab > 0">
                <v-spacer/>
                <v-btn @click="scrollToTop" color="primary" fab small>
                  <v-icon>mdi-arrow-up</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </template>
        </v-col>
        <v-col cols="12" sm="6">
          <v-card outlined :loading="loading" :disabled="loading" id="sign-card">
            <!-- social -->
            <template>
              <v-subheader>
                소셜 로그인
                <v-spacer/>
              </v-subheader>
              <v-card-actions>
                <v-btn block color="#dd4b39" dark @click="signInWithGoogle">
                  <v-icon left>mdi-google</v-icon>
                  <span>구글 로그인</span>
                </v-btn>
              </v-card-actions>
              <v-card-actions>
                <v-btn block color="#242a2e" dark @click="signInWithGithub">
                  <v-icon left>mdi-github</v-icon>
                  <span>깃허브 로그인</span>
                </v-btn>
              </v-card-actions>
              <v-card-actions>
                <v-btn block color="#3b5999" dark @click="signInWithFacebook">
                  <v-icon left>mdi-facebook</v-icon>
                  <span>페이스북 로그인</span>
                </v-btn>
              </v-card-actions>
            </template>

            <v-divider/>

            <template v-if="modeIn">
              <v-form>
                <v-subheader>
                  이메일 로그인
                  <v-spacer/>
                </v-subheader>
                <v-card-text>
                  <v-text-field
                    v-model="email"
                    outlined
                    label="이메일"
                    hide-details
                    type="email"
                    required
                    autocomplete="email"
                    name="email"
                    autofocus
                    class="mb-4"/>
                  <v-text-field
                    v-model="password"
                    type="password"
                    outlined
                    label="비밀번호"
                    hide-details
                    required
                    autocomplete="current-password"
                    name="password"
                    @keypress.native.enter="signInWithEmail"/>
                </v-card-text>
                <v-card-actions>
                  <v-btn block color="primary" @click="signInWithEmail">
                    <v-icon left>mdi-email</v-icon>
                    로그인
                  </v-btn>
                </v-card-actions>
                <v-card-title class="caption">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn text color="primary" v-bind="attrs" v-on="on" @click="sendPasswordResetEmail">
                        비밀번호를 잊으셨나요?
                      </v-btn>
                    </template>
                    <span>클릭시 작성된 이메일로 비밀번호 초기화 메일이 전송됩니다</span>
                  </v-tooltip>
                  <v-btn text color="primary" @click="modeIn=!modeIn">
                    아직 회원이 아니신가요?
                  </v-btn>
                </v-card-title>
              </v-form>
            </template>

            <template v-else>
              <v-form>
                <v-subheader>이메일로 가입</v-subheader>
                <v-card-text>
                  <v-text-field
                    v-model="email"
                    outlined
                    label="이메일"
                    hide-details
                    type="email"
                    autocomplete="email"
                    required
                    name="email"
                    autofocus
                    class="mb-4"/>
                  <v-text-field
                    v-model="displayName"
                    outlined
                    label="닉네임"
                    hide-details
                    type="text"
                    required
                    class="mb-4"/>
                  <v-text-field
                    v-model="password"
                    type="password"
                    outlined
                    label="비밀번호"
                    hide-details
                    required
                    name="password"
                    autocomplete="new-password"
                    @keypress.native.enter="signUpWithEmail"/>
                </v-card-text>
                <v-card-actions>
                  <v-btn block color="info" @click="signUpWithEmail">
                    <v-icon left>mdi-email</v-icon>
                    회원가입
                  </v-btn>
                </v-card-actions>
              </v-form>
            </template>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
import TermsContent from '@/components/terms/content.vue'
import PrivacyContent from '@/components/privacy/content.vue'
import site from '../../siteConfig'
export default {
  components: { TermsContent, PrivacyContent },
  data () {
    return {
      site,
      loading: false,
      modeIn: true,
      email: '',
      password: '',
      displayName: '',
      signInTab: null,
      signUpTab: null
    }
  },
  methods: {
    scrollToTop () {
      document
        .getElementById('sign-card')
        .scrollIntoView({ behavior: 'smooth' })
    },
    async signInWithEmail () {
      if (!this.email || !this.password) throw Error('이메일, 비밀번호를 입력하세요')
      this.loading = true
      try {
        await this.$firebase.auth().signInWithEmailAndPassword(this.email, this.password)
        this.$emit('close')
      } finally {
        this.loading = false
      }
    },
    async sendPasswordResetEmail () {
      if (!this.email) throw Error('이메일을 입력하세요')
      this.loading = true
      try {
        await this.$firebase.auth().sendPasswordResetEmail(this.email)
        this.$toasted.global.notice(this.email + ' 로 패스워드 초기화 메일을 전송했습니다')
      } finally {
        this.loading = false
      }
    },
    async signUpWithEmail () {
      if (!this.email || !this.password || !this.displayName) throw Error('내용을 채워주세요')
      this.loading = true
      try {
        localStorage.setItem('userDisplayName', this.displayName)
        const sn = await this.$firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
        await sn.user.sendEmailVerification()
        this.$toasted.global.notice(`가입이 완료되었습니다. ${sn.user.email}의 이메일을 확인해주세요`)
        this.$emit('close')
      } finally {
        this.loading = false
      }
    },
    async signInWithGoogle () {
      const provider = new this.$firebase.auth.GoogleAuthProvider()
      this.loading = true
      try {
        await this.$firebase.auth().signInWithPopup(provider)
        this.$emit('close')
      } finally {
        this.loading = false
      }
    },
    async signInWithGithub () {
      const provider = new this.$firebase.auth.GithubAuthProvider()
      this.loading = true
      try {
        await this.$firebase.auth().signInWithPopup(provider)
        this.$emit('close')
      } finally {
        this.loading = false
      }
    },
    async signInWithFacebook () {
      const provider = new this.$firebase.auth.FacebookAuthProvider()
      this.loading = true
      try {
        await this.$firebase.auth().signInWithPopup(provider)
        this.$emit('close')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
