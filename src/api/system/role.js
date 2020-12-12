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

export const save = (params) => {
  return axios.request({
    url: 'api/role',
    params,
    method: 'post'
  })
}

export const update = (params) => {
  return axios.request({
    url: 'api/role',
    params,
    method: 'put'
  })
}

export const remove = (params) => {
  return axios.request({
    url: 'api/role',
    data: params,
    method: 'delete'
  })
}

export const exportExcel = (params) => {
  return axios.request({
    url: 'api/role/export',
    method: 'post',
    data: params,
    responseType: "blob",
    headers: {
      'Content-Type': 'application/json'
    },
  })
}