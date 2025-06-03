<template>
  <div class="min-h-screen bg-sky-100 flex flex-col px-4">
    <!-- ✅ Navbar -->
    <header>
      <Navbar />
    </header>

    <!-- ✅ İçerik Alanı -->
    <main class="flex-grow flex items-start justify-center px-4 py-8">
      <div class="w-full max-w-5xl bg-white rounded-3xl shadow-2xl p-8 space-y-6">

        <!-- Sayfa Başlığı -->
        <div class="text-center">
          <h1 class="text-3xl font-bold text-sky-700">
            Gider Defteri – {{ selectedPeriodName }}
          </h1>
          <p class="text-gray-600 text-sm mt-1">Döneme ait harcamalar, kategoriler ve detaylar</p>
        </div>

        <!-- Özet Bilgiler -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Toplam Gider -->
          <div class="bg-gradient-to-r from-red-500 to-red-700 text-white p-6 rounded-2xl shadow-md">
            <h2 class="text-xl font-semibold mb-2 flex items-center gap-2">💸 Toplam Gider</h2>
            <p class="text-4xl font-bold">{{ totalAmount.toFixed(2) }} ₺</p>
          </div>

          <!-- Kategoriye Göre Giderler -->
          <div class="bg-white border border-gray-100 p-6 rounded-2xl shadow-md">
            <h2 class="text-xl font-semibold text-slate-800 mb-4">📊 Kategori Bazlı Giderler</h2>
            <ul class="space-y-1 text-gray-600 text-sm">
              <li
                  v-for="(amount, category) in categoryTotals"
                  :key="category"
                  class="flex justify-between border-b border-gray-100 py-1"
              >
                <span class="font-medium text-slate-700">{{ category }}</span>
                <span>{{ amount.toFixed(2) }} ₺</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Gider Ekle Butonu -->
        <div class="text-center">
          <button
              @click="showModal = true"
              class="bg-sky-600 hover:bg-sky-700 transition-colors text-white font-semibold px-6 py-3 rounded-xl shadow-md"
          >
            ➕ Yeni Gider Ekle
          </button>
        </div>

        <!-- Giderler Tablosu -->
        <div class="bg-white border border-gray-100 p-6 rounded-2xl shadow-md overflow-x-auto">
          <h2 class="text-xl font-semibold text-slate-800 mb-4">🧾 Tüm Giderler</h2>
          <table class="w-full text-sm text-slate-700">
            <thead>
            <tr class="bg-gray-100 text-slate-600">
              <th class="py-3 px-2 text-left">📅 Tarih</th>
              <th class="py-3 px-2 text-left">📂 Kategori</th>
              <th class="py-3 px-2 text-left">📝 Not</th>
              <th class="py-3 px-2 text-left">💰 Tutar</th>
              <th class="py-3 px-2 text-center">İşlem</th>
            </tr>
            </thead>
            <tbody>
            <tr
                v-for="expense in expenses"
                :key="expense.id"
                class="hover:bg-sky-50 border-b border-gray-100"
            >
              <td class="py-2 px-2">{{ formatDate(expense.date) }}</td>
              <td class="py-2 px-2">{{ expense.category }}</td>
              <td class="py-2 px-2">{{ expense.note }}</td>
              <td class="py-2 px-2 text-red-600 font-semibold">
                {{ expense.amount.toFixed(2) }} ₺
              </td>
              <td class="py-2 px-2 text-center">
                <button
                    @click="deleteExpense(expense.id)"
                    class="text-red-500 hover:text-red-700 font-semibold transition"
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
    </main>
  </div>
</template>


<script setup lang="ts">

definePageMeta({
  middleware: ['auth']
})

import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { $fetch } from 'ofetch'
import AddModal from '../pages/components/ekleGider.vue'
import Navbar from '../pages/components/Navbar.vue'

const user = useState('user')

// Tip tanımları
interface Expense {
  id: string;
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
@reference 'tailwindcss';
table th,
table td {
  padding-left: 0.5rem;
}
</style>
