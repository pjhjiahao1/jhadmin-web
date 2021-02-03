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
export const list = (params) => {
  return axios.request({
    url: 'api/menus',
    params,
    method: 'get',
  })
}

export const firstMenu = () => {
  return axios.request({
    url: 'api/menus/firstMenu',
    method: 'get'
  })
}

export const save = (params) => {
  return axios.request({
    url: 'api/menus',
    params,
    method: 'post'
  })
}

export const update = (params) => {
  return axios.request({
    url: 'api/menus',
    params,
    method: 'put'
  })
}

export const remove = (params) => {
  return axios.request({
    url: 'api/menus',
    params,
    method: 'delete'
  })
}