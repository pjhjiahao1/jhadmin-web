import axios from '@/libs/api.request'

export const getData = () => {
    return axios.request({
        url: 'api/monitor',
        method: 'get'
    })
}
