import axios from '@/libs/api.request'

export const getAllRole = () => {
    return axios.request({
      url: 'api/role/all',
      method: 'get'
    })
}

export const listForPage = (params) => {
  return axios.request({
    url: 'api/role',
    params,
    method: 'get'
  })
}