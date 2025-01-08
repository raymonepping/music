<template>
  <div class="flex flex-col min-h-screen">
    <AppHeader />

    <div class="container mx-auto mt-12 p-6 flex-grow">
      <h2 class="text-3xl font-bold text-center mb-8">
        Music Analytics Dashboard
      </h2>

      <!-- Loader -->
      <div v-if="loading" class="text-center text-lg font-medium">
        Loading analytics data...
      </div>

      <!-- Error -->
      <div
        v-if="error"
        class="bg-red-100 text-red-600 p-4 rounded mb-4 text-center"
      >
        <i class="fas fa-exclamation-triangle"></i> {{ error }}
      </div>

      <!-- Analytics Content -->
      <div v-if="!loading && !error && analytics" class="analytics-container">
        <!-- Overall Statistics Table -->
        <div class="mb-8">
          <h3 class="text-xl font-semibold mb-4">Overall Statistics</h3>
          <table
            class="table-auto border-collapse border border-gray-400 w-full text-left"
          >
            <thead>
              <tr class="bg-gray-200">
                <th class="border border-gray-300 px-4 py-2">Metric</th>
                <th class="border border-gray-300 px-4 py-2">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-gray-300 px-4 py-2">Total Songs</td>
                <td class="border border-gray-300 px-4 py-2">
                  {{ analytics.stats.total_songs }}
                </td>
              </tr>
              <tr>
                <td class="border border-gray-300 px-4 py-2">Total Albums</td>
                <td class="border border-gray-300 px-4 py-2">
                  {{ analytics.stats.total_albums }}
                </td>
              </tr>
              <tr>
                <td class="border border-gray-300 px-4 py-2">
                  Average Songs Per Day
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  {{ analytics.stats.average_songs_per_day }}
                </td>
              </tr>
              <tr>
                <td class="border border-gray-300 px-4 py-2">
                  Average Albums Per Day
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  {{ analytics.stats.average_albums_per_day }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script>
import axios from 'axios'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

export default {
  name: 'AnalyticsPage',
  components: {
    AppHeader,
    AppFooter,
  },
  data() {
    return {
      analytics: null,
      error: null,
      loading: true,
    }
  },
  created() {
    this.fetchAnalyticsData()
  },
  methods: {
    async fetchAnalyticsData() {
      this.loading = true
      this.error = null

      try {
        const response = await axios.get('/api/analytics') // Fetch analytics data
        if (response.data && response.data.insights) {
          this.analytics = response.data.insights
        } else {
          this.error = 'Unexpected response structure. Check the API response.'
        }
      } catch (err) {
        this.error = `Error fetching analytics data: ${err.message || err}`
        console.error('Error fetching analytics data:', err)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.analytics-container {
  border: 1px solid #ddd;
  padding: 16px;
  border-radius: 8px;
  max-width: 1100px;
  margin: auto;
}
.table-auto th,
.table-auto td {
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  text-align: left;
}
</style>
