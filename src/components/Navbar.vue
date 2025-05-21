<template>
  <nav class="bg-white shadow-md px-6 py-4 flex justify-between items-center mb-6 rounded-b-2xl">
    <div class="flex space-x-4">
      <button @click="goToPeriodPage" :class="[
        'font-semibold',
        currentRoute === '/period' ? 'text-blue-800' : 'text-blue-600 hover:underline'
      ]">
        Harcama Dönemleri
      </button>

      <button @click="goToAppointmentPage" :class="[
        'font-semibold',
        currentRoute === '/appointment' ? 'text-blue-800' : 'text-blue-600 hover:underline'
      ]">
        Randevular
      </button>

      <button @click="goToCalendarPage" :class="[
        'font-semibold',
        currentRoute === '/calendar' ? 'text-blue-800' : 'text-blue-600 hover:underline'
      ]">
        Takvim
      </button>
    </div>

    <button @click="logout" class="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-md">
      Çıkış
    </button>
  </nav>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const currentRoute = route.path

function goToPeriodPage() {
  router.push('/period')
}

function goToAppointmentPage() {
  router.push('/appointment')
}

function goToCalendarPage() {
  router.push('/calendar')
}

function logout() {
  sessionStorage.clear()
  localStorage.removeItem('token')
  router.push('/')
}
</script>