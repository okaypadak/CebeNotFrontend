import { defineEventHandler, getQuery, getHeaders } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)
    const headers = getHeaders(event)

    const token = headers.authorization

    try {
        return await ofetch(`${config.apiBaseUrl}/periods`, {
            method: 'GET',
            headers: {
                Authorization: token
            },
            params: {
                userId: query.userId
            }
        })
    } catch (err) {
        console.error('Dönemler alınamadı:', err)
        return {
            statusCode: err.response?.status || 500,
            message: err.data?.message || 'Sunucu hatası'
        }
    }
})
