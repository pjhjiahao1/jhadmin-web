import axios from '@/libs/api.request'

export const listForPage = (params) => {
    return axios.request({
        url: 'api/sysjob',
        params,
        method: 'get'
    })
}

export const save = (params) => {
    return axios.request({
        url: 'api/sysjob',
        params,
        method: 'post'
    })
}

export const update = (params) => {
    return axios.request({
        url: 'api/sysjob',
        params,
        method: 'put'
    })
}

export const remove = (params) => {
    return axios.request({
        url: 'api/sysjob',
        data: params,
        method: 'delete'
    })
}

export const findAll = () => {
    return axios.request({
        url: 'api/sysjob/findAll',
        method: 'get'
    })
}

export const exportExcel = (params) => {
    return axios.request({
        url: 'api/sysjob/export',
        method: 'post',
        data: params,
        responseType: "blob",
        headers: {
            'Content-Type': 'application/json'
        },
    })
}