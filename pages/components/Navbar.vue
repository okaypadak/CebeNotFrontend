<template>
  <nav class="bg-white shadow-md px-6 py-4 flex justify-between items-center mb-6 rounded-b-2xl">
    <div class="flex space-x-4">
      <button @click="goTo('/giderDonemler')" :class="linkClass('/giderDonemler')">
        Harcama Dönemleri
      </button>

      <button @click="goTo('/randevular')" :class="linkClass('/randevular')">
        Randevular
      </button>

      <button @click="goTo('/takvim')" :class="linkClass('/takvim')">
        Takvim
      </button>
    </div>

    <button @click="logout" class="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-md">
      Çıkış
    </button>
  </nav>
</template>

<script setup lang="ts">
import { useRoute, navigateTo } from '#imports'
const user = useState('user')  // 🔥 Global kullanıcı state'i
const route = useRoute()

// Linke uygun stil döndür
const linkClass = (path: string): string[] => {
  return [
    'font-semibold',
    route.path === path ? 'text-blue-800' : 'text-blue-600 hover:underline'
  ]
}

// Sayfa yönlendirme
function goTo(path: string): void {
  navigateTo(path)
}

// Çıkış işlemi
function logout(): void {
  user.value = null  // 🧹 Global kullanıcı bilgisini temizle
  navigateTo('/')
}
</script>
