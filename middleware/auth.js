// middleware/auth.ts
export default defineNuxtRouteMiddleware(() => {
  const user = useState('user') // veya useAuthStore()
  if (!user.value || !user.value.id) {
    return navigateTo('/')
  }
})
