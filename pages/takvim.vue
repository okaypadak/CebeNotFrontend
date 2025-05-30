<template>
  <div class="min-h-screen bg-sky-100 flex flex-col px-4">
    <!-- ✅ Navbar -->
    <header>
      <Navbar />
    </header>

    <!-- ✅ İçerik -->
    <main class="flex-grow flex justify-center items-start px-4 py-8">
      <div class="w-full max-w-5xl bg-white rounded-3xl shadow-2xl p-8 space-y-6">

        <!-- Sayfa Başlığı + Yıl Seç -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 class="text-2xl font-bold text-sky-700">📆 Takvim</h1>
          <div class="flex items-center gap-2">
            <label for="year" class="font-medium text-gray-700">Yıl Seç:</label>
            <select
                id="year"
                v-model="selectedYear"
                @change="goToYear"
                class="border border-gray-300 px-3 py-1.5 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
        </div>

        <!-- FullCalendar -->
        <div v-if="hasData" class="overflow-x-auto">
          <FullCalendar ref="calendarRef" :options="calendarOptions" />
        </div>
        <p v-else class="text-center text-slate-500">📭 Takvim verisi bulunamadı.</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import type { CalendarOptions } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import trLocale from '@fullcalendar/core/locales/tr'
import Navbar from '../pages/components/Navbar.vue'

// Veri tipi
interface AppointmentEvent {
  date: string
  explanation?: string
}

// Reaktif veriler
const calendarOptions = ref<CalendarOptions>({})
const hasData = ref<boolean>(false)
const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)
const selectedYear = ref<number | null>(new Date().getFullYear())
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
</script>



<style scoped>
@reference 'tailwindcss';
:deep(.fc) {
  font-family: system-ui, sans-serif;
  font-size: 0.9rem;
}
</style>
