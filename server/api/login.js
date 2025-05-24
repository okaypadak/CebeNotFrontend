import { defineEventHandler, readBody, setCookie } from 'h3'
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  try {
    const res = await ofetch(`${config.public.apiBaseUrl}/api/login`, {
      method: 'POST',
      body
    })

    // 🟢 Cookie ayarla (sunucu taraflı güvenli oturum için)
    setCookie(event, 'user_logged_in', 'true', {
      httpOnly: false,
      path: '/',
      maxAge: 60 * 60,       // 1 saat
      sameSite: 'strict',
      secure: false
    })

    // setCookie(event, 'user_logged_in', 'true', {
    //   httpOnly: true,
    //   path: '/',
    //   maxAge: 60 * 60,
    //   sameSite: 'strict',
    //   secure: process.env.NODE_ENV === 'production' // ✅ bu çok önemli
    // })

    return {
      statusCode: 200,
      message: 'İşlem başarılı',
      token: res.token,
      userId: res.userId
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
