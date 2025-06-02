import { defineEventHandler, readBody } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const config = useRuntimeConfig()
        const headers = getRequestHeaders(event)


        const response = await ofetch(`${config.apiBaseUrl}/expenses`, {
            method: 'POST',
            headers: {
                Authorization: headers.authorization || ''
            },
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
