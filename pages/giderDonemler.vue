<template>
  <div class="min-h-screen bg-sky-100 flex flex-col px-4">
    <!-- ✅ Sabit Mavi Navbar -->
    <header class="text-white z-10">
     <Navbar/>
    </header>

    <!-- ✅ Orta Beyaz Alan (Kart Görünümü) -->
    <main class="flex-grow flex items-center justify-center px-4 py-6">
      <div class="w-full max-w-5xl bg-white rounded-3xl shadow-2xl p-8 space-y-6">

        <!-- Başlık -->
        <div class="text-center">
          <h2 class="text-3xl font-bold text-sky-700">Dönem Seç</h2>
          <p class="text-gray-600 mt-1 text-sm">Gider girişleri için bir dönem seçin veya yeni bir dönem oluşturun.</p>
        </div>

        <!-- Yeni Dönem Ekle -->
        <form @submit.prevent="addPeriod" class="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <input
              v-model="newPeriod"
              placeholder="Örn: 2025-05"
              class="input-field w-64 text-center"
          />
          <button
              type="submit"
              class="bg-sky-600 text-white px-5 py-2.5 rounded-md hover:bg-sky-700 transition"
          >
            ➕ Ekle
          </button>
        </form>

        <!-- Dönem Kartları -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div
              v-for="p in periods"
              :key="p._id"
              @click="goToDashboard(p)"
              class="bg-sky-50 rounded-xl shadow-sm p-5 text-center cursor-pointer hover:bg-sky-100 hover:scale-[1.02] transition"
          >
            <p class="text-xl font-semibold text-sky-700">{{ p.period }}</p>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from '../pages/components/Navbar.vue'

definePageMeta({ middleware: ['auth'] })

import { ref, onMounted } from 'vue'

interface Period {
  id: string
  period: string
}

const newPeriod = ref('')
const periods = ref<Period[]>([])
const token = useState<string>('user')

async function fetchPeriods() {
  try {
    const res = await $fetch<Period[]>('/api/periods', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token.value}` }
    })

    if (Array.isArray(res)) {
      periods.value = res.sort((a, b) => b.period.localeCompare(a.period))
    }
  } catch (err: any) {
    console.error('Dönemleri getirirken hata:', err?.data?.message || err?.message)
  }
}

async function addPeriod() {
  if (!newPeriod.value.trim()) return

  try {
    await $fetch('/periods', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: { period: newPeriod.value.trim() }
    })

    newPeriod.value = ''
    await fetchPeriods()
  } catch (err: any) {
    console.error('Dönem eklenirken hata:', err?.data || err.message)
  }
}

function goToDashboard(periodObj: Period) {
  navigateTo({
    name: 'giderler',
    query: {
      periodId: periodObj.id,
      period: periodObj.period
    }
  })
}

onMounted(fetchPeriods)
</script>

<style scoped>
@reference 'tailwindcss';

.input-field {
  @apply px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition;
}
</style>
