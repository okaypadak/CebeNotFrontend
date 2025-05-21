<template>
    <div class="p-4">
        <Navbar/>
        <div class="flex items-center gap-2 mb-4">
            <label for="year" class="font-semibold text-gray-700">Yıl Seç:</label>
            <select id="year" v-model="selectedYear" @change="goToYear" class="border p-1 rounded">
                <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
        </div>

        <!-- Takvim -->
        <FullCalendar ref="calendarRef" v-if="hasData" :options="calendarOptions" />
        <p v-else>Takvim verisi bulunamadı</p>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import trLocale from '@fullcalendar/core/locales/tr'
import Navbar from '../components/Navbar.vue'

const calendarOptions = ref({})
const hasData = ref(false)
const calendarRef = ref(null)
const selectedYear = ref(null)

onMounted(async () => {
  try {
    const response = await axios.get('/appointments/events')

    if (Array.isArray(response.data) && response.data.length > 0) {
      const eventList = response.data.map((event, index) => ({
        id: index.toString(),
        title: event.explanation || 'Randevu',
        start: new Date(event.date).toISOString().slice(0, 10),
        allDay: true
      }))

      calendarOptions.value = {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        locale: trLocale,
        events: eventList
      }

      hasData.value = true
    } else {
      hasData.value = false
    }
  } catch (error) {
    console.error('Veri alınırken hata:', error)
    hasData.value = false
  }
})

const years = Array.from({ length: 15 }, (_, i) => 2020 + i)

function goToYear() {
    const calendarApi = calendarRef.value.getApi()
    const currentDate = calendarApi.getDate()
    const newDate = new Date(currentDate)
    newDate.setFullYear(selectedYear.value)
    calendarApi.gotoDate(newDate)
}

onMounted(() => {
  const currentYear = new Date().getFullYear()
  selectedYear.value = currentYear
})
</script>