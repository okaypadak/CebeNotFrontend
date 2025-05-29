<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <Navbar />
    <h1 class="text-3xl font-bold text-gray-800 mb-6">
      Gider Defteri Dashboard - {{ selectedPeriodName }}
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- Toplam Gider -->
      <div class="bg-gradient-to-r from-red-500 to-red-700 text-white p-6 rounded-2xl shadow-lg">
        <h2 class="text-xl font-semibold mb-2 flex items-center">💸 Toplam Gider</h2>
        <p class="text-4xl font-bold">{{ totalAmount.toFixed(2) }} ₺</p>
      </div>

      <!-- Kategori Bazlı Giderler -->
      <div class="bg-white p-6 rounded-2xl shadow-lg">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">📊 Kategoriye Göre Giderler</h2>
        <ul class="space-y-1 text-gray-600">
          <li
              v-for="(amount, category) in categoryTotals"
              :key="category"
              class="flex justify-between border-b border-gray-200 py-1"
          >
            <span class="font-medium">{{ category }}</span>
            <span>{{ amount.toFixed(2) }} ₺</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Gider Ekle Butonu -->
    <div class="mb-6">
      <button
          @click="showModal = true"
          class="bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold px-6 py-3 rounded-xl shadow"
      >
        + Yeni Gider Ekle
      </button>
    </div>

    <!-- Tüm Giderler Tablosu -->
    <div class="bg-white p-6 rounded-2xl shadow-lg overflow-x-auto">
      <h2 class="text-xl font-semibold text-gray-700 mb-4">🧾 Tüm Giderler</h2>
      <table class="w-full text-left text-sm text-gray-700">
        <thead>
        <tr class="bg-gray-100">
          <th class="py-3 px-2">📅 Tarih</th>
          <th class="py-3 px-2">📂 Kategori</th>
          <th class="py-3 px-2">📝 Not</th>
          <th class="py-3 px-2">💰 Tutar</th>
          <th class="py-3 px-2"></th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="expense in expenses"
            :key="expense._id"
            class="hover:bg-gray-50 border-b"
        >
          <td class="py-2 px-2">{{ formatDate(expense.date) }}</td>
          <td class="py-2 px-2">{{ expense.category }}</td>
          <td class="py-2 px-2">{{ expense.note }}</td>
          <td class="py-2 px-2 text-red-600 font-semibold">
            {{ expense.amount.toFixed(2) }} ₺
          </td>
          <td class="py-2 px-2">
            <button
                @click="deleteExpense(expense._id)"
                class="text-red-500 hover:text-red-700 font-semibold"
                title="Sil"
            >
              ✖
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <AddModal :visible="showModal" @close="showModal = false" @add="handleAddExpense" />
  </div>
</template>

<script setup lang="ts">

definePageMeta({
  middleware: ['auth']
})

import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { $fetch } from 'ofetch'
import AddModal from '../pages/components/randevuEkle.vue'
import Navbar from '../pages/components/Navbar.vue'

const user = useState('user')

// Tip tanımları
interface Expense {
  _id: string;
  date: string;
  category: string;
  note: string;
  amount: number;
}

const route = useRoute()
const expenses = ref<Expense[]>([])
const showModal = ref(false)
const token = useState<string>('user')
const selectedPeriodId = ref<string>((route.query.periodId || '').toString())
const selectedPeriodName = ref<string>((route.query.period || '').toString())

// Harcama verilerini çek
async function fetchExpenses() {
  if (!selectedPeriodId.value) return
  try {
    const response = await $fetch<Expense[]>('/api/expenses', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      params: { period: selectedPeriodId.value }
    })
    expenses.value = response
  } catch (error: any) {
    console.error('Giderler alınamadı:', error?.message || 'Bilinmeyen bir hata oluştu')
  }
}

// Harcama sil
async function deleteExpense(id: string) {
  const confirmDelete = confirm("Bu gideri silmek istediğinize emin misiniz?");
  if (!confirmDelete) return;

  try {
    await $fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
    });
    await fetchExpenses();
  } catch (error: any) {
    console.error("Gider silinemedi:", error?.message || 'Silme hatası');
  }
}

// Harcama ekle
async function handleAddExpense(data: Expense) {
  try {
    const payload = {
      ...data,
      period: selectedPeriodId.value
    }
    await $fetch('/api/expenses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      body: payload
    })
    await fetchExpenses()
  } catch (err) {
    console.error('Gider eklenemedi:', err)
  }
}

onMounted(() => {
  if (selectedPeriodId.value) fetchExpenses()
})

// Toplam gider
const totalAmount = computed(() =>
    expenses.value.reduce((sum, item) => sum + Number(item.amount), 0)
)

// Kategori bazlı toplam
const categoryTotals = computed(() => {
  const totals: Record<string, number> = {}
  for (const item of expenses.value) {
    const category = item.category
    if (!totals[category]) {
      totals[category] = 0
    }
    totals[category] += Number(item.amount)
  }
  return totals
})

// Tarih formatla
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? 'Geçersiz Tarih' : date.toLocaleDateString('tr-TR')
}
</script>

<style scoped>
table th,
table td {
  padding-left: 0.5rem;
}
</style>
