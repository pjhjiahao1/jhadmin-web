import axios from '@/libs/api.request'
export const listForPage = (params) => {
    return axios.request({
      url: 'api/generator',
      params,
      method: 'get'
    })
}

export const build = (params) => {
    return axios.request({
      url: 'api/generator',
      method: 'post',
      data: params,
      responseType: "blob",
      headers: {
        'Content-Type': 'application/json'
        },
    })
}
