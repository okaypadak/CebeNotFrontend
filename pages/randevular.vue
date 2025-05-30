<template>
  <div class="min-h-screen bg-sky-100 flex flex-col px-4">
    <!-- ✅ Navbar -->
    <header>
      <Navbar />
    </header>

    <!-- ✅ İçerik -->
    <main class="flex-grow flex items-start justify-center px-4 py-8">
      <div class="w-full max-w-5xl bg-white rounded-3xl shadow-2xl p-8 space-y-6">

        <!-- Başlık -->
        <div class="text-center">
          <h2 class="text-3xl font-bold text-sky-700">📅 Dönem Bilgisi</h2>
          <p class="text-slate-600 text-sm mt-1">Tanımlı dönemler ve kalan süre bilgileri</p>
        </div>

        <!-- Dönem Listesi -->
        <div v-if="hasData" class="space-y-6">
          <div
              v-for="(appointmentEvent, index) in appointmentEvents"
              :key="index"
              class="bg-sky-50 border border-gray-200 p-4 rounded-xl shadow-sm space-y-1"
          >
            <p><strong>Tarih:</strong> {{ formatDate(appointmentEvent.date) }}</p>
            <p><strong>Açıklama:</strong> {{ appointmentEvent.explanation }}</p>

            <p v-if="getRemainingText(appointmentEvent.date)" class="text-green-700 font-semibold">
              ⏳ {{ getRemainingText(appointmentEvent.date) }}
            </p>
            <p v-else class="text-red-600 font-semibold">🛑 Süre doldu</p>

            <button
                @click="deleteEvent(appointmentEvent)"
                class="text-sm text-red-600 hover:underline"
            >
              ❌ Sil
            </button>
          </div>
        </div>
        <div v-else class="text-center text-slate-500">📭 Henüz bir dönem verisi bulunamadı.</div>

        <!-- Yeni Dönem Ekleme Formu -->
        <div class="border-t pt-6">
          <h3 class="text-xl font-semibold text-slate-800 mb-4 text-center">➕ Yeni Dönem Ekle</h3>
          <form @submit.prevent="submitCycle" class="grid gap-4 sm:grid-cols-2">
            <div class="col-span-2 sm:col-span-1">
              <label class="block text-sm text-slate-600 mb-1">Başlangıç Tarihi</label>
              <VueDatePicker
                  v-model="formStart"
                  :format="'dd-MM-yyyy'"
                  locale="tr"
                  input-class="input-field w-full"
              />
            </div>
            <div>
              <label class="block text-sm text-slate-600 mb-1">Süre (gün)</label>
              <input type="number" v-model.number="formDays" class="input-field w-full" />
            </div>
            <div class="col-span-2">
              <label class="block text-sm text-slate-600 mb-1">Açıklama</label>
              <textarea v-model="formExplanation" class="input-field w-full" rows="2" placeholder="Dönem açıklaması..."></textarea>
            </div>
            <div class="col-span-2 sm:col-span-1">
              <label class="block text-sm text-slate-600 mb-1">Tekrar Sıklığı</label>
              <select v-model="formRepeat" class="input-field w-full">
                <option value="once">Sadece 1 Kez</option>
                <option value="daily">Her Gün</option>
                <option value="weekly">Haftada Bir</option>
                <option value="monthly">Ayda Bir</option>
              </select>
            </div>
            <div class="col-span-2 text-center">
              <button type="submit" class="bg-sky-600 text-white px-6 py-2 rounded-lg shadow hover:bg-sky-700 transition">
                💾 Kaydet
              </button>
            </div>
          </form>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Navbar from '../pages/components/Navbar.vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

interface AppointmentEvent {
  _id: string
  appointmentId: string
  date: Date
  explanation: string
}

const appointmentEvents = ref<AppointmentEvent[]>([])
const hasData = ref<boolean>(true)

const formStart = ref<Date>(new Date())
const formDays = ref<number>(0)
const formExplanation = ref<string>('')
const formRepeat = ref<'once' | 'daily' | 'weekly' | 'monthly'>('once')

onMounted(async () => {
  try {
    const response = await $fetch('/api/appointmentsEvents')
    if (Array.isArray(response) && response.length > 0) {
      appointmentEvents.value = response.map((event: any) => ({
        ...event,
        date: new Date(event.date)
      }))
      hasData.value = true
    } else {
      hasData.value = false
    }
  } catch (error) {
    console.error('Veri alınırken hata:', error)
    hasData.value = false
  }
})

function getRemainingText(endDate: Date | string): string | null {
  if (!endDate) return null
  const now = new Date()
  const end = new Date(endDate)

  if (end <= now) return null

  let years = end.getFullYear() - now.getFullYear()
  let months = end.getMonth() - now.getMonth()
  let days = end.getDate() - now.getDate()

  if (days < 0) {
    months--
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0)
    days += prevMonth.getDate()
  }

  if (months < 0) {
    years--
    months += 12
  }

  return `${years} yıl ${months} ay ${days} gün kaldı`
}

async function submitCycle() {
  const userId = localStorage.getItem('userId')

  try {
    const response = await $fetch('/api/appointments', {
      method: 'POST',
      body: {
        userId: userId,
        start: formStart.value,
        durationDays: formDays.value,
        explanation: formExplanation.value,
        repeat: formRepeat.value
      }
    })

    const start = new Date(formStart.value)
    const end = new Date(start)
    end.setDate(end.getDate() + formDays.value)

    const newEvent = {
      _id: Date.now().toString(),
      appointmentId: response.appointmentId || '',
      date: end,
      explanation: formExplanation.value
    }

    appointmentEvents.value.unshift(newEvent)

    formStart.value = new Date()
    formDays.value = 0
    formExplanation.value = ''
    formRepeat.value = 'once'
    hasData.value = true
  } catch (err) {
    console.error('Dönem kaydedilemedi:', err?.data?.message || err.message)
  }
}

async function deleteEvent(app: AppointmentEvent) {
  if (!app.appointmentId) {
    console.warn('❌ appointmentId eksik, silme iptal edildi')
    return
  }

  try {
    await $fetch(`/api/appointments/${app.appointmentId}`, {
      method: 'DELETE'
    })
    appointmentEvents.value = appointmentEvents.value.filter(one => one._id !== app._id)
  } catch (err) {
    console.error('Silme işlemi başarısız:', err?.data?.message || err.message)
  }
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}
</script>

<style scoped>
@reference 'tailwindcss';

.input-field {
  @apply bg-gray-50 px-4 py-2.5 border border-gray-300 rounded-md shadow-sm
  focus:outline-none focus:ring-2 focus:ring-sky-500 transition;
}

:deep(.dp__input) {
  background-color: var(--color-gray-50, oklch(98.5% 0.002 247.839));
  height: 46px !important;
  line-height: 1.25rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
</style>
