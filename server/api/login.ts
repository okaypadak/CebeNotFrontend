import { defineEventHandler, readBody } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    console.log('Gelen login verisi:', body)

    const res = await ofetch('http://cebenotbackend.railway.internal/api/login', {
      method: 'POST',
      body,
    })

    return res
  } catch (err) {
    console.error('Login API hatası:', err)
    return { statusCode: 500, message: 'Giriş başarısız' }
  }
})
