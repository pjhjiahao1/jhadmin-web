<template>
  <Form ref="loginForm" :model="form" :rules="rules" @keydown.enter.native="handleSubmit">
    <FormItem prop="userName">
      <Input v-model="form.userName" placeholder="请输入用户名">
        <span slot="prepend">
          <Icon :size="16" type="ios-person"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem prop="password">
      <Input type="password" v-model="form.password" placeholder="请输入密码">
        <span slot="prepend">
          <Icon :size="14" type="md-lock"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem prop="captcode">
      <Row>
        <Col span="12">
          <Input v-model="form.captcode" placeholder="请输入验证码">
            <span slot="prepend">
              <Icon type="ios-text" slot="prefix" />
            </span>
          </Input>
        </Col>
        <Col span="6" offset="3">
            <img :src="form.codeUrl" @click="getCode">
        </Col>
      </Row>
    </FormItem>
    <FormItem>
      <Button @click="handleSubmit" type="primary" long>登录</Button>
    </FormItem>
  </Form>
</template>
<script>
import './login.less'
import { mapActions } from 'vuex'
export default {
  name: 'LoginForm',
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
        userName: 'admin',
        password: '',
        captcode: '',
        codeUrl: '',
        uuid: ''
      }
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
      'getAuthCode'
    ]),
    handleSubmit () {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.$emit('on-success-valid', {
            userName: this.form.userName,
            password: this.form.password,
            captcode: this.form.captcode
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
    }
  },
  mounted () {
    this.getAuthCodes()
  }
}
</script>
