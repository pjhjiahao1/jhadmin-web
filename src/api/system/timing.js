import axios from '@/libs/api.request'

export const listForPage = (params) => {
    return axios.request({
        url: 'api/jobs',
        params,
        method: 'get'
    })
}

export const save = (params) => {
    return axios.request({
        url: 'api/jobs',
        params,
        method: 'post'
    })
}

export const update = (params) => {
    return axios.request({
        url: 'api/jobs',
        params,
        method: 'put'
    })
}

export const remove = (params) => {
    return axios.request({
        url: 'api/jobs',
        data: params,
        method: 'delete'
    })
}

export const exportExcel = (params) => {
    return axios.request({
        url: 'api/jobs/export',
        method: 'post',
        data: params,
        responseType: "blob",
        headers: {
            'Content-Type': 'application/json'
        },
    })
}

export const run = (params) => {
    return axios.request({
        url: 'api/jobs/run',
        params,
        method: 'put'
    })
}

export const pause = (params) => {
    return axios.request({
        url: 'api/jobs/pause',
        params,
        method: 'put'
    })
}

export const resume = (params) => {
    return axios.request({
        url: 'api/jobs/resume',
        params,
        method: 'put'
    })
}

export const infoListForPage = (params) => {
    return axios.request({
        url: 'api/sysquartzlog',
        params,
        method: 'get'
    })
}