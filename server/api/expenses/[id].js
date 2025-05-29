import {defineEventHandler, readBody} from 'h3'
import {ofetch} from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const { id } = getRouterParams(event)
    const headers = getRequestHeaders(event)

    try {
        return await ofetch(`${config.apiBaseUrl}/api/expenses/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: headers.authorization || ''
            },
        })

    } catch (err) {
        console.error('🛑 Randevu gönderme hatası:', err)
        return {
            statusCode: err.response?.status || 500,
            message: err.data?.message || 'Sunucu hatası'
        }
    }
})
