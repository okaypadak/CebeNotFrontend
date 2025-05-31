import { defineEventHandler, readBody, getHeader, createError, sendError } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
    if (event.req.method !== 'POST') {
        return sendError(event, createError({ statusCode: 405, statusMessage: 'Method Not Allowed' }))
    }

    const config = useRuntimeConfig()
    const body = await readBody(event)
    const authHeader = getHeader(event, 'authorization')
    const token = authHeader ? authHeader.replace('Bearer ', '') : null

    if (!token) {
        return sendError(event, createError({ statusCode: 401, statusMessage: 'Yetkisiz erişim (Token yok)' }))
    }

    if (!body.period || typeof body.period !== 'string') {
        return sendError(event, createError({ statusCode: 400, statusMessage: 'Geçersiz dönem bilgisi' }))
    }

    try {
        const result = await ofetch(`${config.apiBaseUrl}/api/periods`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: {
                period: body.period
            }
        })

        return result
    } catch (err) {
        console.error('Sunucu tarafı hata:', err?.data || err.message)
        return sendError(event, createError({ statusCode: 500, statusMessage: 'Sunucu hatası' }))
    }
})
