import {
  getBreadCrumbList,
  setTagNavListInLocalstorage,
  getMenuByRouter,
  getTagNavListFromLocalstorage,
  getHomeRoute,
  getNextRoute,
  routeHasExist,
  routeEqual,
  getRouteTitleHandled,
  localSave,
  localRead,
  filterUserRouter, //
} from '@/libs/util'
// import { saveErrorLogger } from '@/api/data'
import router from '@/router'
import routers from '@/router/routers'
import config from '@/config'
import { buildMenus } from '@/api/system/menu'
import { filterAsyncRouter } from '@/store/permiss'
const { homeName } = config
import { forEach } from '@/libs/tools'
const closePage = (state, route) => {
  const nextRoute = getNextRoute(state.tagNavList, route)
  state.tagNavList = state.tagNavList.filter(item => {
    return !routeEqual(item, route)
  })
  router.push(nextRoute)
}

export default {
  state: {
    breadCrumbList: [],
    tagNavList: [],
    homeRoute: {},
    local: localRead('local'),
    errorList: [],
    hasReadErrorPage: false,
    routers: [],//拿到的路由数据
    hasGetRouter: false//是否已经拿过路由数据
  },
  getters: {
    // menuList: (state, getters, rootState) => getMenuByRouter(routers, rootState.user.access),
    //把routers.js里的路由跟动态加载的合一起作为左侧导航菜单
    // menuList: (state, getters, rootState) => getMenuByRouter(routers.concat(state.routers), rootState.user.access),
    menuList: (state, getters, rootState) => getMenuByRouter(routers.concat(state.routers)),
    // menuList: (state, getters, rootState) => getMenuByRouter(router.options.routes, rootState.user.access),
    // menuList: (state, getters, rootState) => getMenuByRouter(routers, rootState.user.access),
    errorCount: state => state.errorList.length
  },
  mutations: {
    //设置路由数据
    setRouters(state, routers) {
      state.routers = routers
    },
    //设置自定义路由数据
    setCustomRouter(state, list) {
      state.custom_router = list
    },
    //设置是否已经拿过路由
    setHasGetRouter(state, status) {
      state.hasGetRouter = status
    },
    setBreadCrumb (state, route) {
      state.breadCrumbList = getBreadCrumbList(route, state.homeRoute)
    },
    setHomeRoute (state, routes) {
      state.homeRoute = getHomeRoute(routes, homeName)
    },
    setTagNavList (state, list) {
      let tagList = []
      if (list) {
        tagList = [...list]
      } else tagList = getTagNavListFromLocalstorage() || []
      if (tagList[0] && tagList[0].name !== homeName) tagList.shift()
      let homeTagIndex = tagList.findIndex(item => item.name === homeName)
      if (homeTagIndex > 0) {
        let homeTag = tagList.splice(homeTagIndex, 1)[0]
        tagList.unshift(homeTag)
      }
      state.tagNavList = tagList
      setTagNavListInLocalstorage([...tagList])
    },
    closeTag (state, route) {
      let tag = state.tagNavList.filter(item => routeEqual(item, route))
      route = tag[0] ? tag[0] : null
      if (!route) return
      closePage(state, route)
    },
    addTag (state, { route, type = 'unshift' }) {
      let router = getRouteTitleHandled(route)
      if (!routeHasExist(state.tagNavList, router)) {
        if (type === 'push') state.tagNavList.push(router)
        else {
          if (router.name === homeName) state.tagNavList.unshift(router)
          else state.tagNavList.splice(1, 0, router)
        }
        setTagNavListInLocalstorage([...state.tagNavList])
      }
    },
    setLocal (state, lang) {
      localSave('local', lang)
      state.local = lang
    },
    addError (state, error) {
      state.errorList.push(error)
    },
    setHasReadErrorLoggerStatus (state, status = true) {
      state.hasReadErrorPage = status
    }
  },
  actions: {
    /**
     * 从后台获取用户拥有的菜单路径
     * @param commit
     * @returns {Promise<unknown>}
     */
    getMenuData ({commit}) {
      return new Promise((resolve, reject) => {
        try {
          buildMenus().then(res => {
            const asyncRouter = filterAsyncRouter(res.data.data)
            let route = filterUserRouter(asyncRouter)
            let emptyArr = []
            forEach(routers, item => {
              emptyArr.push(item)
            })
            forEach(route, item => {
              emptyArr.push(item)
            })
            commit('setCustomRouter',emptyArr)
            commit('setRouters', route)
            // alert(2)
            commit('setHasGetRouter', true)
            resolve(route)
          }).catch(err => {
            reject(err)
          })
        } catch (error) {
          reject(error)
        }
      })
    }
     /**
     * 获取系统路由
     * @param commit
     * @returns {Promise<unknown>}
     */
    // getRouters({commit}) {
    //   return new Promise((resolve, reject) => {
    //     try {
    //       getRouterReq().then(res => {
    //         let routers = backendMenusToRouters(res.data)
    //         commit('setRouters', routers)
    //         commit('setHasGetRouter', true)
    //         resolve(routers)
    //       }).catch(err => {
    //         reject(err)
    //       })
    //     } catch (error) {
    //       reject(error)
    //     }
    //   })
    // },
  }
}
