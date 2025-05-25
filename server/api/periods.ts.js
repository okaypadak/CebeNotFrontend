import {defineEventHandler, readBody} from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const body = await readBody(event)

    try {
        return await $fetch(`${config.apiBase}/periods`, {
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