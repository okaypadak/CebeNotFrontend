import {defineEventHandler} from 'h3'
import {ofetch} from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    try {
        return await ofetch(`${config.public.apiBaseUrl}/api/appointmentsEvents`, {
            method: 'GET'
        }) // event listesi
    } catch (err) {
        console.error('📛 Randevu event verisi alınamadı:', err)
        return {
            statusCode: err.response?.status || 500,
            message: err.data?.message || 'Sunucu hatası'
        }
    }
})
