// middleware/auth.js
export default defineNuxtRouteMiddleware((to, from) => {
  const cookie = useCookie('user_logged_in')

  // Eğer cookie yoksa veya false ise anasayfaya yönlendir
  if (!cookie.value || cookie.value !== 'true') {
    return navigateTo('/')
  }
})