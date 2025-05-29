import { defineEventHandler, readBody } from 'h3'
import {ofetch} from 'ofetch'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  try {
    const res = await ofetch(`${config.apiBaseUrl}/api/login`, {
      method: 'POST',
      body
    })

    console.log("token:" + res.token);

    return {
      statusCode: 200,
      message: 'İşlem başarılı',
      token: res.token
    }

  } catch (error) {
    if (error.response?.status === 401) {
      return {
        statusCode: 401,
        message: 'Kullanıcı adı veya şifre yanlış'
      }
    }

    console.error('Sunucu hatası:', error)

    return {
      statusCode: 500,
      message: 'Sunucu hatası'
    }
  }
})
