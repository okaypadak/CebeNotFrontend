import {defineEventHandler, getQuery} from 'h3'
import {ofetch} from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)
    const headers = getRequestHeaders(event)

    try {
        return await ofetch(`${config.apiBaseUrl}/expenses`, {
            method: 'GET',
            headers: {
                Authorization: headers.authorization || ''
            },
            params: {
                period: query.period
            }
        })
    } catch (err) {
        console.error('Express API hata:', err)

        return {
            statusCode: err?.response?.status || 500,
            message: err?.response?.data?.message || 'Sunucu hatası'
        }
    }
})
