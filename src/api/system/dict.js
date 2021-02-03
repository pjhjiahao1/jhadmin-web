import axios from '@/libs/api.request'

export const listForPage = (params) => {
    return axios.request({
        url: 'api/sysdict',
        params,
        method: 'get'
    })
}

export const find = (params) => {
    return axios.request({
        url: 'api/sysdict/find',
        params,
        method: 'get'
    })
}


export const get = (dictName) => {
    const params = {
        'code': dictName
    }
    return axios.request({
      url: 'api/sysdict/getDictDetail',
      params,
      method: 'get'
    })
  }

export const save = (params) => {
    return axios.request({
        url: 'api/sysdict',
        params,
        method: 'post'
    })
}

export const update = (params) => {
    return axios.request({
        url: 'api/sysdict',
        params,
        method: 'put'
    })
}

export const remove = (params) => {
    return axios.request({
        url: 'api/sysdict',
        data: params,
        method: 'delete'
    })
}

export const exportExcel = (params) => {
    return axios.request({
        url: 'api/sysdict/export',
        method: 'post',
        data: params,
        responseType: "blob",
        headers: {
            'Content-Type': 'application/json'
        },
    })
}