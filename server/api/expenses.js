import { defineEventHandler, readBody } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const config = useRuntimeConfig()

        // Express backend'e yönlendirme
        const response = await ofetch(`${config.apiBaseUrl}/api/expenses`, {
            method: 'POST',
            body,
        })

        return response
    } catch (error) {
        console.error('Backend API çağrısı başarısız:', error)
        return {
            statusCode: 500,
            message: 'Sunucu hatası: gider eklenemedi',
        }
    }
})
