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

<script setup lang="ts">

definePageMeta({
  middleware: ['auth']
})

import { ref, onMounted } from 'vue'
import Navbar from '/pages/components/Navbar.vue'

// 🟢 Tip tanımlamaları
interface Period {
  _id: string
  period: string
}

const newPeriod = ref<string>('')
const periods = ref<Period[]>([])
const token = useState<string>('user')

async function fetchPeriods(): Promise<void> {
  try {
    const res = await $fetch<Period[]>('/api/periods', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })

    if (Array.isArray(res)) {
      periods.value = res.sort((a, b) => b.period.localeCompare(a.period))
    } else {
      console.error('Beklenmeyen veri yapısı:', res)
    }
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || 'Bilinmeyen hata'
    console.error('Dönemleri getirirken hata:', msg)
  }
}

async function addPeriod(): Promise<void> {
  if (!newPeriod.value.trim()) return

  try {
    await $fetch('/api/periods', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: {
        period: newPeriod.value.trim()
      }
    })

    newPeriod.value = ''
    await fetchPeriods()
  } catch (err: any) {
    console.error('Dönem eklenirken hata:', err?.data || err.message)
  }
}

function goToDashboard(periodObj: Period): void {
  navigateTo({
    name: 'giderler',
    query: {
      periodId: periodObj._id,
      period: periodObj.period
    }
  })
}

onMounted(fetchPeriods)
</script>
