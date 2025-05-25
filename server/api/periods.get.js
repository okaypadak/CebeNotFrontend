import {defineEventHandler, getQuery} from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event) // ⬅️ userId buradan alınır

    try {
        return await $fetch(`${config.apiBaseUrl}/api/periods`, {
            method: 'GET',
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
