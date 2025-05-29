import {defineEventHandler, readBody} from 'h3'
import {ofetch} from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody(event)

    try {
        return await ofetch(`${config.apiBase}/api/periods`, {
            method: 'POST',
            body
        })
    } catch (error) {
        console.error('Period ekleme hatası:', error)
        return {
            statusCode: error.response?.status || 500,
            message: error.response?.data || 'Bir hata oluştu'
        }
    }
})