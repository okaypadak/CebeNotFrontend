<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-200 to-sky-400 px-4">
    <div class="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 space-y-6">

      <!-- Gömülü SVG Logo ve Başlık -->
      <div class="text-center">
        <div class="mx-auto w-14 h-14 mb-2">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" stroke="#0284c7" stroke-width="4" fill="#e0f2fe" />
            <path d="M30 50h40M50 30v40" stroke="#0284c7" stroke-width="6" stroke-linecap="round" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-sky-700 tracking-wide">Cebenot</h1>
        <p class="text-sm text-slate-600 mt-1">Kişisel Takip Sisteminiz</p>
      </div>

      <!-- Giriş Formu -->
      <form @submit.prevent="login" class="space-y-5">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">Kullanıcı Adı</label>
          <input v-model="username" type="text" placeholder="kullanici" class="input-field" required />
        </div>

        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1">Şifre</label>
          <input v-model="password" type="password" placeholder="••••••••" class="input-field" required />
        </div>

        <button
            type="submit"
            class="w-full py-2.5 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 hover:scale-[1.02] transition-transform"
        >
          Giriş Yap
        </button>

        <p v-if="error" class="text-red-600 text-sm text-center mt-2 font-medium">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref('')
const user = useState('user')
const router = useRouter()

interface LoginResponse {
  statusCode: number
  message?: string
  token?: string
}

async function login(): Promise<void> {
  try {
    const res = await $fetch<LoginResponse>('/api/login', {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value
      }
    })

    if (res.statusCode === 200) {
      user.value = res.token
      router.push('/giderDonemler')
    } else {
      error.value = res.message || 'Kullanıcı adı veya şifre hatalı'
    }

  } catch (err) {
    console.error('İstek hatası:', err)
    error.value = 'Sunucuya erişilemiyor. Lütfen daha sonra tekrar deneyin.'
  }
}
</script>

<style scoped>
@reference 'tailwindcss';

.input-field {
  @apply w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition;
}
</style>
