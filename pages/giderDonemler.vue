<template>
 
  <div class="p-6 bg-gray-100">
    <Navbar />
    <h1 class="text-2xl font-bold mb-4">Dönem Seç</h1>

    <!-- ✅ Yeni Dönem Ekle -->
    <form @submit.prevent="addPeriod" class="flex gap-2 mb-6">
      <input
        v-model="newPeriod"
        placeholder="Örn: 2025-05"
        class="border rounded px-3 py-2 w-64"
      />
      <button class="bg-blue-600 text-white px-4 py-2 rounded">Ekle</button>
    </form>

    <!-- 📃 Dönem Listesi -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="p in periods"
        :key="p._id"
        @click="goToDashboard(p)"
        class="bg-white p-4 rounded-xl shadow cursor-pointer hover:bg-blue-50">
        <p class="text-lg font-semibold text-blue-700">{{ p.period }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Navbar from '/pages/components/Navbar.vue'

/**
 * @type {import('vue').Ref<string>}
 */
const newPeriod = ref('')

/**
 * @type {import('vue').Ref<Array<{ _id: string, period: string, members?: string[] }>>}
 */
const periods = ref([])

/**
 * Dönemleri getirir
 */
async function fetchPeriods() {
  try {
    const userId = localStorage.getItem('userId')

    if (!userId) {
      console.warn('userId bulunamadı.')
      return
    }

    const res = await $fetch('/api/periods', {
      method: 'GET',
      params: { userId }
    })

    if (Array.isArray(res)) {
      periods.value = res.sort((a, b) => b.period.localeCompare(a.period))
    } else {
      console.error('Beklenmeyen veri yapısı:', res)
    }
  } catch (err) {
    const msg = err?.data?.message || err?.message || 'Bilinmeyen hata'
    console.error('Dönemleri getirirken hata:', msg)
  }
}

/**
 * Yeni dönem ekler
 */
async function addPeriod() {
  if (!newPeriod.value.trim()) return

  try {
    await $fetch('/api/periods', {
      method: 'POST',
      body: {
        period: newPeriod.value.trim()
      }
    })

    newPeriod.value = ''
    await fetchPeriods()
  } catch (err) {
    console.error('Dönem eklenirken hata:', err?.data || err.message)
  }
}

/**
 * Giderler sayfasına yönlendirir
 * @param {{ _id: string, period: string }} periodObj
 */
function goToDashboard(periodObj) {
  return navigateTo({
    name: 'giderler',
    query: {
      periodId: periodObj._id,
      period: periodObj.period
    }
  })
}

// İlk yüklendiğinde dönemleri getir
onMounted(fetchPeriods)
</script>