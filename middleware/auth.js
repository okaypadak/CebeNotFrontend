export default defineNuxtRouteMiddleware(() => {
  const cookie = useCookie('user_logged_in')
  console.log("kontrol: "+cookie.value)
  if (!cookie.value) {
    return navigateTo('/')
  }
})
