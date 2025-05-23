export default defineNuxtRouteMiddleware(() => {
  if (process.client) {
    const isLoggedIn = document.cookie.includes('user_logged_in=true')
    if (!isLoggedIn) {
      return navigateTo('/')
    }
  }
})