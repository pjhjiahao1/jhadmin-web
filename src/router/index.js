import Vue from 'vue'
import Router from 'vue-router'
import routes from './routers'
import store from '@/store'
import iView from 'iview'
import { setToken, getToken, canTurnTo, setTitle } from '@/libs/util'
import config from '@/config'
const { homeName } = config

Vue.use(Router) 
const router = new Router({
  routes,
  mode: 'hash'
})
const LOGIN_PAGE_NAME = 'login'

const turnTo = (to, access, next) => {
  if(access.indexOf('admin') > -1){
    next()
  } else {
    if (canTurnTo(to.name, access, store.state.app.custom_router))
      next() // 有权限，可访问
    else 
      next({ replace: true, name: 'error_401' }) // 无权限，重定向到401页面
  }
}

const initRouters = (to, store, next) => {
  //这个人登录了已经
  if (store.state.user.hasGetInfo) {
    //路由加载过了 等于0表示 用户无权限可查看一些无权限页面
    if (store.state.app.hasGetRouter && store.state.app.routers && (store.state.app.routers.length > 0 || store.state.app.routers.length == 0)) {
      turnTo(to, store.state.user.access, next)
    } else {
      //加载路由
      store.dispatch('getMenuData').then(routers => {
        //此处routers已经是按照权限过滤后的路由了，没权限的，不加入路由，无法访问
        //路由重置一下把404放最后
        const newRouter = new Router({
          routes,
          mode: config.routerModel
        })
        router.matcher = newRouter.matcher;
        //把404加最后面，如果用router.push({name:'xxxx'})这种的话，404页面可能空白，用path:'/aa/bb'
        router.addRoutes(routers.concat([{
          path: '*',
          name: 'error_404',
          meta: {
            hideInMenu: true
          },
          component: () => import(/* webpackChunkName: "404" */'@/view/error-page/404.vue')
        }]))
        // 判断权限
        turnTo(to, store.state.user.access, next)
      }).finally(() => {
      })
    }
  }
}


router.beforeEach((to, from, next) => {
  iView.LoadingBar.start()
  const token = getToken()
  if (!token && to.name !== LOGIN_PAGE_NAME) {
    // 未登录且要跳转的页面不是登录页
    next({
      name: LOGIN_PAGE_NAME // 跳转到登录页
    })
  } else if (!token && to.name === LOGIN_PAGE_NAME) {
    // 未登陆且要跳转的页面是登录页
    next() // 跳转
  } else if (token && to.name === LOGIN_PAGE_NAME) {
    // 已登录且要跳转的页面是登录页
    next({
      name: homeName // 跳转到homeName页
    })
  } else {
    if (store.state.user.hasGetInfo) { // 判断当前用户是否已拉取完user_info信息
      initRouters(to, store, next)
    } else {
      store.dispatch('getUserInfo').then(user => {
        // 拉取用户信息，通过用户权限和跳转的页面的name来判断是否有权限访问;access必须是一个数组，如：['super_admin'] ['super_admin', 'admin']
        initRouters(to, store, next)
      }).catch((err) => {
        setToken('')
        next({
          name: 'login'
        })
      })
    }
  }
})
router.afterEach(to => {
  setTitle(to, router.app)
  iView.LoadingBar.finish()
  window.scrollTo(0, 0)
})

export default router
