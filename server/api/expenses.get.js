import {defineEventHandler, getQuery} from 'h3'
import {$fetch, ofetch} from 'ofetch'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const query = getQuery(event)

    console.log("periodId:"+query.period)

    try {
        return await ofetch(`${config.public.apiBaseUrl}/api/expenses`, {
            method: 'GET',
            params: {
                period: query.period
            }
        })
    } catch (err) {
        console.error('Express API hata:', err)

        return {
            statusCode: err?.response?.status || 500,  // Handle possible undefined response
            message: err?.response?.data?.message || 'Sunucu hatası'  // Default message if no specific error
        }
    }
})
