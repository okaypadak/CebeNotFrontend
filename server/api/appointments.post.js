import {defineEventHandler, readBody} from 'h3'
import {ofetch} from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody(event)

    try {
        return await ofetch(`${config.apiBaseUrl}/appointments`, {
            method: 'POST',
            body
        })

    } catch (err) {
        console.error('🛑 Randevu gönderme hatası:', err)
        return {
            statusCode: err.response?.status || 500,
            message: err.data?.message || 'Sunucu hatası'
        }
    }
})
