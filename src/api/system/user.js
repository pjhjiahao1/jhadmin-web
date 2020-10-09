import axios from '@/libs/api.request'

export const listForPage = (params) => {
    return axios.request({
      url: 'api/user',
      params,
      method: 'get'
    })
}

export const save = (params) => {
  return axios.request({
    url: 'api/user',
    params,
    method: 'post'
  })
}

export const update = (params) => {
  return axios.request({
    url: 'api/user',
    params,
    method: 'put'
  })
}

export const remove = (params) => {
  return axios.request({
    url: 'api/user',
    params,
    method: 'delete'
  })
}