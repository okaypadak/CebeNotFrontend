// server/middleware/auth.ts
export default defineEventHandler((event) => {
    getCookie(event, 'user_logged_in');
})
