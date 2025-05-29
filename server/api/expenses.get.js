import {defineEventHandler, getQuery} from 'h3'
import {ofetch} from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)
    const headers = getRequestHeaders(event)

    console.log("🔍 [Nuxt API] İstenen periodId:", query.period)
    console.log("📥 [Nuxt API] Gelen Authorization Header:", headers.authorization)

    try {
        return await ofetch(`${config.apiBaseUrl}/api/expenses`, {
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
            statusCode: err?.response?.status || 500,  // Handle possible undefined response
            message: err?.response?.data?.message || 'Sunucu hatası'  // Default message if no specific error
        }
    }
})
