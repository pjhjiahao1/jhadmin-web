<style lang="less">
  @import './login.less';
</style>

<template>
  <div class="login">
    <Form ref="loginForm" :model="form" :rules="rules" @keydown.enter.native="handleSubmit" class="login-form">
      <FormItem prop="userName" class="formitem2">
        <i-input v-model="form.userName" placeholder="请输入用户名">
          <span slot="prepend">
            <Icon :size="16" type="ios-person"></Icon>
          </span>
        </i-input>
      </FormItem>
      <FormItem prop="password" class="formitem2">
        <i-input type="password" v-model="form.password" placeholder="请输入密码">
          <span slot="prepend">
            <Icon :size="14" type="md-lock"></Icon>
          </span>
        </i-input>
      </FormItem>
      <FormItem prop="captcode" class="formitem">
        <Row>
          <i-col span="12">
            <i-input v-model="form.captcode" placeholder="请输入验证码">
              <span slot="prepend">
                <Icon type="ios-text" slot="prefix" />
              </span>
            </i-input>
          </i-col>
          <i-col span="6" offset="3">
            <div class="login-code">
              <img :src="form.codeUrl" @click="getCode">
            </div>
          </i-col>
        </Row>
      </FormItem>
      <FormItem class="formitem">
        <Row>
          <i-col span="12">
            <Checkbox v-model="form.rememberMe">记住我</Checkbox>
          </i-col>
          <i-col span="12">
            <p>账号：admin 密码：123456</p>
          </i-col>
        </Row>
        
      </FormItem>
      <FormItem>
        <!-- <Button @click="handleSubmit" type="primary" long>登录</Button> -->
        <Button type="primary" :loading="loading" @click="handleSubmit" long>
          <span v-if="!loading">登录</span>
          <span v-else>登陆中...</span>
      </Button>
      </FormItem>
    </Form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { setCookie, getCookie, removeCookie } from '@/libs/util'
import { decrypt } from '@/libs/rsaEncrypt'
import { Notice } from 'iview'
export default {
  props: {
    userNameRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '账号不能为空', trigger: 'blur' }
        ]
      }
    },
    passwordRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '密码不能为空', trigger: 'blur' }
        ]
      }
    },
    captcodeRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '验证码不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  data () {
    return {
      form: {
        userName: '',
        password: '',
        captcode: '',
        codeUrl: '',
        uuid: '',
        rememberMe: false
      },
      cookiePass: '',
      loading: false,
    }
  },
  computed: {
    rules () {
      return {
        userName: this.userNameRules,
        password: this.passwordRules,
        captcode: this.captcodeRules
      }
    }
  },
  methods: {
    ...mapActions([
      'handleLogin',
      'getUserInfo',
      'getAuthCode'
    ]),
    handleSubmit () {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true
          let userName = this.form.userName
          let password = this.form.password
          let captcode = this.form.captcode
          let rememberMe = this.form.rememberMe
          let uuid = this.form.uuid
          this.handleLogin({ userName, password, captcode, uuid, rememberMe }).then(res => {
            if (rememberMe) {
              setCookie('username',res.userinfo.username)
              setCookie('password',res.userinfo.password)
              setCookie('rememberMe',rememberMe)
            } else {
              removeCookie('username')
              removeCookie('password')
              removeCookie('rememberMe')
            }
            this.getUserInfo().then(res => {
              this.$router.push({
                name: this.$config.homeName
              })
            })
          }).catch(err => {
              this.loading = false
              this.getAuthCodes()
          })
        }
      })
    },
    getCode () {
      this.getAuthCodes()
    },
    getAuthCodes () {
      let _this = this
      this.getAuthCode().then(res => {
        _this.form.codeUrl = res.img
        _this.form.uuid = res.uuid
      })
    },
    getCookie() {
      const username = getCookie('username')
      let password = getCookie('password')
      const rememberMe = getCookie('rememberMe')
      // 保存cookie里面的加密后的密码
      this.cookiePass = password === '' ? '' : password
      password = password === '' ? this.form.password : decrypt(password)
      this.form.userName = username === '' ? this.form.userName : username
      this.form.password = password
      this.form.rememberMe = rememberMe === '' ? false : Boolean(rememberMe)
    },
    point() {
      const point = getCookie('point') !== ''
      if (point) {
        Notice.warning({
          title: '消息通知',
          desc: "当前登录状态已过期，请重新登录！"
        });
        removeCookie('point')
      }
    }
  },
  mounted () {
    // 获取验证码
    this.getAuthCodes()
    // 获取用户名密码等Cookie
    this.getCookie()
    // token 过期提示
    this.point()
  }
}
</script>

<style>

</style>
