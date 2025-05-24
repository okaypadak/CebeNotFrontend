<template>
  <div class="p-4">
    <Navbar />
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

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import FullCalendar from '@fullcalendar/vue3'
import type { CalendarOptions } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import trLocale from '@fullcalendar/core/locales/tr'
import Navbar from '../pages/components/Navbar.vue'

// Veri tipi tanımı
interface AppointmentEvent {
  date: string
  explanation?: string
}

// Reaktif değişkenler
const calendarOptions = ref<CalendarOptions>({})
const hasData = ref<boolean>(false)
const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)
const selectedYear = ref<number | null>(null)

const years: number[] = Array.from({ length: 15 }, (_, i) => 2020 + i)

onMounted(async () => {
  try {
    const response = await $fetch('/api/appointmentsEvents')

    if (Array.isArray(response) && response.length > 0) {
      const eventList = response.map((event, index) => ({
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

function goToYear(): void {
  const calendarApi = calendarRef.value?.getApi()
  if (!calendarApi || selectedYear.value === null) return

  const currentDate = calendarApi.getDate()
  const newDate = new Date(currentDate)
  newDate.setFullYear(selectedYear.value)
  calendarApi.gotoDate(newDate)
}

// Sayfa ilk yüklendiğinde geçerli yıl ayarla
onMounted(() => {
  selectedYear.value = new Date().getFullYear()
})
</script>
