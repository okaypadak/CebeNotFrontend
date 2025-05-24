<template>
  <div class="bg-gray-100 p-10 m-5 rounded-xl shadow border space-y-4">
    <Navbar />
    <h2 class="text-xl font-bold text-gray-800">📅 Dönem Bilgisi</h2>

    <div v-if="hasData">
      <div v-for="(appointmentEvent, index) in appointmentEvents" :key="index"
           class="bg-white space-y-1 text-gray-700 text-sm border p-3 rounded mb-4">
        <p><strong>Tarih:</strong> {{ formatDate(appointmentEvent.date) }}</p>
        <p><strong>Açıklama:</strong> {{ appointmentEvent.explanation }}</p>

        <p v-if="getRemainingText(appointmentEvent.date)" class="text-green-700 font-semibold">
          ⏳ {{ getRemainingText(appointmentEvent.date) }}
        </p>
        <p v-else class="text-red-600 font-semibold">🛑 Süre doldu</p>

        <!-- 🚮 Sil Butonu -->
        <button @click="deleteEvent(appointmentEvent)" class="mt-2 text-red-600 hover:underline text-sm">
          ❌ Sil
        </button>
      </div>
    </div>
    <div v-else>
      <p>📭 Herhangi bir veri bulunamadı.</p>
    </div>

    <!-- Yeni dönem ekleme formu -->
    <div class="mt-6 border-t pt-4">
      <h3 class="text-md font-semibold mb-2 text-gray-700">Yeni Dönem Ekle</h3>
      <form @submit.prevent="submitCycle" class="space-y-2">
        <div>
          <label class="block text-sm text-gray-600">Başlangıç Tarihi</label>
          <VueDatePicker v-model="formStart" :format="'dd-MM-yyyy'" locale="tr" />
        </div>
        <div>
          <label class="block text-sm text-gray-600">Süre (gün)</label>
          <input type="number" v-model.number="formDays" class="bg-white border rounded p-2 w-full" />
        </div>
        <div>
          <label class="block text-sm text-gray-600">Açıklama</label>
          <textarea v-model="formExplanation" class="bg-white border rounded p-2 w-full" rows="2" placeholder="Dönem açıklaması..."></textarea>
        </div>
        <div>
          <label class="block text-sm text-gray-600">Tekrar Sıklığı</label>
          <select v-model="formRepeat" class="bg-white border rounded p-2 w-full">
            <option value="once">Sadece 1 Kez</option>
            <option value="daily">Her Gün</option>
            <option value="weekly">Haftada Bir</option>
            <option value="monthly">Ayda Bir</option>
          </select>
        </div>
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Kaydet
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Navbar from '../pages/components/Navbar.vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

// Tip tanımı
interface AppointmentEvent {
  _id: string
  appointmentId: string
  date: Date
  explanation: string
}

const appointmentEvents = ref<AppointmentEvent[]>([])
const hasData = ref<boolean>(true)

// Form verileri
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

    // Formu sıfırla
    formStart.value = new Date()
    formDays.value = 0
    formExplanation.value = ''
    formRepeat.value = 'once'
    hasData.value = true

  } catch (err) {
    console.error('Dönem kaydedilemedi:', err?.data?.message || err.message)
  }
}


async function deleteEvent(app) {
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
