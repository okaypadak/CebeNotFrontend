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
          <label class="block text-sm text-gray-600">Açıklama</label>
          <!-- <input type="date" v-model="rawDate" class="border rounded p-2 w-full" /> -->
          <VueDatePicker v-model="formStart" :format="'dd-MM-yyyy'" locale="tr"></VueDatePicker>
        </div>
        <div>
          <label class="block text-sm text-gray-600">Süre (gün)</label>
          <input type="number" v-model.number="formDays" formatter="dateformat" class="bg-white border rounded p-2 w-full" />

        </div>
        <div>
          <label class="block text-sm text-gray-600">Açıklama</label>
          <textarea v-model="formExplanation" class="bg-white border rounded p-2 w-full" rows="2"
            placeholder="Dönem açıklaması..."></textarea>
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

<script setup>
import { ref, computed, onMounted } from 'vue'
import Navbar from '../components/Navbar.vue'
import axios from 'axios'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const appointmentEvents = ref([])
const startDate = ref(null)
const endDate = ref(null)
const durationDays = ref(0)
const explanation = ref('')
const hasData = ref(true)

const formStart = ref(new Date())
const formDays = ref(0)
const formExplanation = ref('')
const formRepeat = ref('once')
hasData.value = true


onMounted(async () => {
  try {
    const response = await axios.get('/appointments/events')

    if (Array.isArray(response.data) && response.data.length > 0) {
      appointmentEvents.value = response.data.map(event => ({
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

function getRemainingText(endDate) {
  if (!endDate) return null;

  const now = new Date();
  endDate = new Date(endDate);
  if (endDate <= now) return null;

  let years = endDate.getFullYear() - now.getFullYear();
  let months = endDate.getMonth() - now.getMonth();
  let days = endDate.getDate() - now.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years} yıl ${months} ay ${days} gün kaldı`;
}


async function submitCycle() {
  try {
    const response = await axios.post('/appointments', {
      start: formStart.value,
      durationDays: formDays.value,
      explanation: formExplanation.value,
      repeat: formRepeat.value
    })

    const startDate = new Date(formStart.value)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + formDays.value)

    const newEvent = {
      date: endDate,
      explanation: formExplanation.value
    }

    appointmentEvents.value.unshift(newEvent)

    formStart.value = new Date()
    formDays.value = 0
    formExplanation.value = ''
    formRepeat.value = 'once'

    hasData.value = true
  } catch (err) {
    console.error('Dönem kaydedilemedi:', err)
  }
}

async function deleteEvent(app) {
  try {
    await axios.delete(`/appointments/${app.appointmentId}`)
    appointmentEvents.value = appointmentEvents.value.filter(one => one._id !== app._id)
  } catch (err) {
    console.error('Silme işlemi başarısız:', err)
  }
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}
</script>
