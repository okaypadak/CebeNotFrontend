import {defineEventHandler, readBody} from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody(event)

    try {
        return await $fetch(`${config.apiBaseUrl}/api/appointments`, {
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
