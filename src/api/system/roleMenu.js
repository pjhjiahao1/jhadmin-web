import axios from '@/libs/api.request'

export const saveRoleMenu = (params) => {
    return axios.request({
      url: 'api/rolemenu',
      data: params,
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
        },
    })
}