import axios from '@/libs/api.request'

export const buildMenus = () => {
  return axios.request({
    url: 'api/menus/build',
    method: 'get'
  })
}
export const buildTree = (params) => {
  return axios.request({
    url: 'api/menus/tree',
    params,
    method: 'get'
  })
}