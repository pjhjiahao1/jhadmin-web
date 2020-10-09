import axios from '@/libs/api.request'

export const getRouterReq = (access) => {
  return axios.request({
    url: '/sys/routers',
    params: {
      access
    },
    method: 'get'
  })
}

/**
 * 获取用户权限数组,组合路由和菜单 mock测试
 * @returns {never}
 * @param params
 */
export const getUserPerms = (params) => {
  return axios.request({
    url: '/user/menus',
    method: 'post'
  })
}
