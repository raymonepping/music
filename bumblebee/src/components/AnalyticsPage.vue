<template>
  <div>
    <HeaderPage />
    <div class="container mx-auto mt-12 p-6">
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

        <!-- Songs Added by Date Table -->
        <div class="mb-8">
          <h3 class="text-xl font-semibold mb-4">Songs Added by Date</h3>
          <table
            class="table-auto border-collapse border border-gray-400 w-full text-left"
          >
            <thead>
              <tr class="bg-gray-200">
                <th class="border border-gray-300 px-4 py-2">Date</th>
                <th class="border border-gray-300 px-4 py-2">
                  Number of Songs
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in analytics.stats.music_aggregations"
                :key="item.date"
              >
                <td class="border border-gray-300 px-4 py-2">
                  {{ item.date }}
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  {{ item.count }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Albums Added by Date Table -->
        <div class="mb-8">
          <h3 class="text-xl font-semibold mb-4">Albums Added by Date</h3>
          <table
            class="table-auto border-collapse border border-gray-400 w-full text-left"
          >
            <thead>
              <tr class="bg-gray-200">
                <th class="border border-gray-300 px-4 py-2">Date</th>
                <th class="border border-gray-300 px-4 py-2">
                  Number of Albums
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in analytics.stats.albums_by_date"
                :key="item.date"
              >
                <td class="border border-gray-300 px-4 py-2">
                  {{ item.date }}
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  {{ item.count }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Artists Table -->
        <div class="mb-8">
          <h3 class="text-xl font-semibold mb-4">Artists</h3>
          <table
            class="table-auto border-collapse border border-gray-400 w-full text-left"
          >
            <thead>
              <tr class="bg-gray-200">
                <th class="border border-gray-300 px-4 py-2">Artist</th>
                <th class="border border-gray-300 px-4 py-2">Date</th>
                <th class="border border-gray-300 px-4 py-2">Songs</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="artist in analytics.stats.artists"
                :key="artist.artist + artist.date"
              >
                <td class="border border-gray-300 px-4 py-2">
                  {{ artist.artist }}
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  {{ artist.date }}
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  {{ artist.count }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Albums Per Artist Table -->
        <div class="mb-8">
          <h3 class="text-xl font-semibold mb-4">Albums Per Artist</h3>
          <table
            class="table-auto border-collapse border border-gray-400 w-full text-left"
          >
            <thead>
              <tr class="bg-gray-200">
                <th class="border border-gray-300 px-4 py-2">Date</th>
                <th class="border border-gray-300 px-4 py-2">Artist</th>
                <th class="border border-gray-300 px-4 py-2">Albums</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in analytics.stats.albums_by_artist"
                :key="item.artist + item.date"
              >
                <td class="border border-gray-300 px-4 py-2">
                  {{ item.date }}
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  {{ item.artist }}
                </td>
                <td class="border border-gray-300 px-4 py-2">
                  {{ item.count }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script>
import axios from "axios";

import HeaderPage from "./HeaderPage.vue";
import Footer from "./Footer.vue";

export default {
  name: "AnalyticsPage",
  components: {
    HeaderPage,
    Footer,
  },
  data() {
    return {
      analytics: null,
      loading: true,
      error: null,
    };
  },
  async mounted() {
    try {
      const response = await axios.get("/api/analytics");
      const insights = response.data.insights || {};
      this.analytics = insights;

      if (!this.analytics?.stats) {
        throw new Error("Incomplete or missing analytics data.");
      }
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      this.error = "Failed to load analytics data.";
    } finally {
      this.loading = false;
    }
  },
};
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
