import {defineEventHandler, getRouterParams} from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const { id } = getRouterParams(event)

    try {
        return await $fetch(`${config.public.apiBaseUrl}/api/appointments/${id}`, {
            method: 'DELETE'
        })
    } catch (err) {
        console.error('🗑️ Silme hatası:', err)
        return {
            statusCode: err.response?.status || 500,
            message: err.data?.message || 'Sunucu hatası'
        }
    }
})
