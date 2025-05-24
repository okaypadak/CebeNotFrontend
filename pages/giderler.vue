<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <Navbar />
    <h1 class="text-3xl font-bold text-gray-800 mb-6">
      Gider Defteri Dashboard - {{ selectedPeriodName }}
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- Toplam Gider -->
      <div class="bg-gradient-to-r from-red-500 to-red-700 text-white p-6 rounded-2xl shadow-lg">
        <h2 class="text-xl font-semibold mb-2 flex items-center">
          💸 Toplam Gider
        </h2>
        <p class="text-4xl font-bold">{{ totalAmount.toFixed(2) }} ₺</p>
      </div>

      <!-- Kategori Bazlı Giderler -->
      <div class="bg-white p-6 rounded-2xl shadow-lg">
        <h2 class="text-xl font-semibold text-gray-700 mb-4">📊 Kategoriye Göre Giderler</h2>
        <ul class="space-y-1 text-gray-600">
          <li v-for="(amount, category) in categoryTotals" :key="category"
            class="flex justify-between border-b border-gray-200 py-1">
            <span class="font-medium">{{ category }}</span>
            <span>{{ amount.toFixed(2) }} ₺</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Gider Ekle Butonu -->
    <div class="mb-6">
      <button @click="showModal = true"
        class="bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold px-6 py-3 rounded-xl shadow">
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
          <tr v-for="expense in expenses" :key="expense._id" class="hover:bg-gray-50 border-b">
            <td class="py-2 px-2">{{ formatDate(expense.date) }}</td>
            <td class="py-2 px-2">{{ expense.category }}</td>
            <td class="py-2 px-2">{{ expense.note }}</td>
            <td class="py-2 px-2 text-red-600 font-semibold">{{ expense.amount }} ₺</td>
            <td class="py-2 px-2">
              <button @click="deleteExpense(expense._id)" class="text-red-500 hover:text-red-700 font-semibold"
                title="Sil">
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
definePageMeta({middleware: ['auth']})

import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { $fetch } from 'ofetch' // Using $fetch
import AddModal from '../pages/components/randevuEkle.vue'
import Navbar from '../pages/components/Navbar.vue'

// Defining types for expense and period data
interface Expense {
  _id: string;
  date: string;
  category: string;
  note: string;
  amount: number;
}

interface Period {
  periodId: string;
  period: string;
}

const route = useRoute()

// Using type annotations for reactive properties
const expenses = ref<Expense[]>([])  // Array of Expense objects
const showModal = ref<boolean>(false)

const selectedPeriodId = ref<string>((route.query.periodId || '').toString())  // periodId is string
const selectedPeriodName = ref<string>((route.query.period || '').toString())  // periodName is string


// Fetching expenses for the selected period
async function fetchExpenses() {
  try {
    const response = await $fetch<Expense[]>('/api/expenses', {
      method: 'GET',
      params: { period: selectedPeriodId.value }  // Bu doğru şekilde query parametresi olarak gönderilecek
    })
    expenses.value = response
  } catch (error) {
    console.error('Giderler alınamadı:', error?.message || 'Bilinmeyen bir hata oluştu')
  }
}


// Deleting an expense
async function deleteExpense(id: string) {
  const confirmDelete = confirm("Bu gideri silmek istediğinize emin misiniz?");
  if (!confirmDelete) return;

  try {
    await $fetch(`/expenses/${id}`, {
      method: 'DELETE'
    });
    // Refresh the list after deletion
    await fetchExpenses();
  } catch (error) {
    console.error("Gider silinemedi:", error.response?.data || error.message);
  }
}

onMounted(fetchExpenses)

// Calculating the total amount
const totalAmount = computed<number>(() =>
    expenses.value.reduce((sum, item) => sum + item.amount, 0)
)

// Calculating total by category
const categoryTotals = computed<Record<string, number>>(() => {
  const totals: Record<string, number> = {}
  for (const item of expenses.value) {
    if (!totals[item.category]) {
      totals[item.category] = 0
    }
    totals[item.category] += item.amount
  }
  return totals
})

// Formatting date
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('tr-TR')
}

// Handling the addition of a new expense
async function handleAddExpense(data: Expense) {
  try {
    const payload = {
      ...data,
      period: selectedPeriodId.value,  // Corrected here
    }

    await $fetch('/expenses', {
      method: 'POST',
      body: payload
    })
    await fetchExpenses()
  } catch (err) {
    console.error('Gider eklenemedi:', err)
  }
}
</script>


<style scoped>
table th,
table td {
  padding-left: 0.5rem;
}
</style>