import axios from 'axios'
import router from '@/router/routers'
import Cookies from 'js-cookie'
import { getToken } from '@/libs/util'
import { logout } from '@/api/user'
import { Notice } from 'iview';
// const addErrorLog = errorInfo => {
//   const { statusText, status, request: { responseURL } } = errorInfo
//   let info = {
//     type: 'ajax',
//     code: status,
//     mes: statusText,
//     url: responseURL
//   }
//   if (!responseURL.includes('save_error_logger')) store.dispatch('addErrorLog', info)
// }

class HttpRequest {
  constructor (baseUrl = baseURL) {
    this.baseUrl = baseUrl
    this.queue = {}
  }
  getInsideConfig () {
    const config = {
      baseURL: this.baseUrl,
      headers: {
        //
      }
    }
    return config
  }
  destroy (url) {
    delete this.queue[url]
    if (!Object.keys(this.queue).length) {
      // Spin.hide()
    }
  }
  interceptors (instance, url) {
    // 请求拦截
    instance.interceptors.request.use(config => {
      // 添加全局的loading...
      if (!Object.keys(this.queue).length) {
        // Spin.show() // 不建议开启，因为界面不友好
      }
      this.queue[url] = true
      if (getToken()) {
        config.headers['Authorization'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
      }
      config.headers['Content-Type'] = 'application/json'
      return config
    }, error => {
      return Promise.reject(error)
    })
    // 响应拦截
    instance.interceptors.response.use(res => {
      this.destroy(url)
      const { data, status } = res
      const code = data.code
      if (code < 200 || code > 300) {
        Notice.warning({
          title: '消息通知',
          desc: data.msg
        });
        return Promise.reject("")
      } else {
        return { data, status }
      }
    }, error => {
      // debugger
      // this.destroy(url)
      // let errorInfo = error.response
      // if (!errorInfo) {
      //   const { request: { statusText, status }, config } = JSON.parse(JSON.stringify(error))
      //   errorInfo = {
      //     statusText,
      //     status,
      //     request: { responseURL: config.url }
      //   }
      // }
      let code = 0
      try {
        code = error.response.data.status
      } catch (e) {
        if (error.toString().indexOf('Error: timeout') !== -1) {
          Notice.warning({
            title: '消息通知',
            desc: "网络请求超时"
          });
          return Promise.reject(error)
        }
      }
      if (code) {
        if (code === 401) {
          logout().then(() => {
            Cookies.set('point', 401)
            location.reload()
          }).catch(err => {
            reject(err)
          })
        } else if (code === 403) {
          router.push({ path: '/401' })
        } else {
          const errorMsg = error.response.data.message
          if (errorMsg !== undefined) {
            Notice.warning({
              title: '消息通知',
              desc: errorMsg
            });
          }
        }
      } else {
        if (code == undefined) {
          const errcode = error.response.data.code
          if (errcode === 400 || errcode === 401 || errcode === 403 || errcode === 404 || errcode === 500) {
            Notice.warning({
              title: '消息通知',
              desc: error.response.data.msg
            });
          }
          
        }
        
      }
      return Promise.reject(error)
    })
  }
  request (options) {
    const instance = axios.create()
    options = Object.assign(this.getInsideConfig(), options)
    this.interceptors(instance, options.url)
    return instance(options)
  }
}
export default HttpRequest
