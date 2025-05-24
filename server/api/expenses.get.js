import {defineEventHandler, getQuery} from 'h3'
import {$fetch} from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)

    console.log("periodId:"+query.period)

    try {
        // Access the period correctly
        return await $fetch(`${config.public.apiBaseUrl}/api/expenses`, {
            method: 'GET',
            params: {
                period: query.period // Accessing the query parameter directly
            }
        })
    } catch (err) {
        console.error('Express API hata:', err)

        // Return a proper error response
        return {
            statusCode: err?.response?.status || 500,  // Handle possible undefined response
            message: err?.response?.data?.message || 'Sunucu hatası'  // Default message if no specific error
        }
    }
})
