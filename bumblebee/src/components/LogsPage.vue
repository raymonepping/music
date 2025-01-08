<template>
  <div>
    <HeaderPage />
    <div class="container mx-auto mt-12 p-6">
      <h2 class="text-3xl font-bold text-center mb-8">Container Logs Viewer</h2>

      <!-- Input Field with Auto-Completion -->
      <div class="flex justify-center mb-8">
        <div class="relative w-1/3">
          <input
            type="text"
            v-model="containerName"
            @input="fetchContainerSuggestions"
            placeholder="Enter container name"
            class="border border-gray-400 p-2 rounded w-full"
            autocomplete="off"
          />

          <!-- Suggestions Dropdown -->
          <ul
            v-if="containerSuggestions.length"
            class="absolute bg-white border mt-1 rounded shadow max-h-40 overflow-auto w-full z-10"
          >
            <li
              v-for="(suggestion, index) in containerSuggestions"
              :key="index"
              @click="selectContainer(suggestion)"
              class="p-2 cursor-pointer hover:bg-gray-200"
            >
              {{ suggestion.container_name }}
            </li>
          </ul>
        </div>
        <button
          @click="fetchLogs"
          class="bg-blue-500 text-white px-4 py-2 ml-4 rounded hover:bg-blue-600"
        >
          Fetch Logs
        </button>
      </div>

      <!-- Error Message -->
      <div
        v-if="error"
        class="bg-red-100 text-red-600 p-4 rounded mb-4 text-center"
      >
        <i class="fas fa-exclamation-triangle"></i> {{ error }}
      </div>

      <!-- Container Info -->
      <div
        v-if="!loading && !error && selectedContainerName"
        class="mb-8 text-center"
      >
        <h3 class="text-2xl font-bold mb-2">{{ selectedContainerName }}</h3>
        <p class="text-gray-600 italic text-sm">
          {{ containerDescription }}
        </p>
      </div>

      <!-- Loader -->
      <div v-if="loading" class="text-center text-lg font-medium">
        Loading logs...
      </div>

      <!-- Logs Table -->
      <div v-if="!loading && logs.length > 0" class="logs-container mx-auto">
        <table
          class="table-auto border-collapse border border-gray-400 w-full text-left"
        >
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-gray-300 px-4 py-2">Timestamp</th>
              <th class="border border-gray-300 px-4 py-2">Level</th>
              <th class="border border-gray-300 px-4 py-2">Message</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.timestamp">
              <td class="border border-gray-300 px-4 py-2">
                {{ formatTimestamp(log.timestamp) }}
              </td>
              <td class="border border-gray-300 px-4 py-2">{{ log.level }}</td>
              <td class="border border-gray-300 px-4 py-2">
                {{ log.message }}
              </td>
            </tr>
          </tbody>
        </table>
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
  name: "LogsPage",
  components: {
    HeaderPage,
    Footer,
  },
  data() {
    return {
      containerName: "",
      containerSuggestions: [], // Auto-complete suggestions
      selectedContainerName: "",
      containerDescription: "",
      logs: [],
      loading: false,
      error: null,
    };
  },
  methods: {
    async fetchContainerSuggestions() {
      if (this.containerName.length < 2) {
        this.containerSuggestions = [];
        return;
      }

      try {
        const response = await axios.get(`/api/logs/autocomplete`, {
          params: { query: this.containerName },
        });
        // Keep both container_name and description in suggestions
        this.containerSuggestions = response.data.containers || [];
      } catch (error) {
        console.error("Error fetching container suggestions:", error);
      }
    },
    selectContainer(container) {
      this.containerName = container.container_name; // Show only the container name in the input
      this.selectedContainerName = container.container_name;
      this.containerDescription = container.description; // Keep description for display above the table
      this.containerSuggestions = []; // Clear suggestions dropdown
    },
    async fetchLogs() {
      if (!this.containerName.trim()) {
        this.error = "Container name cannot be empty.";
        return;
      }

      this.error = null;
      this.logs = [];
      this.loading = true;

      try {
        const response = await axios.get(`/api/logs`, {
          params: {
            container_name: this.containerName,
            limit: 10,
          },
        });
        this.logs = response.data;
      } catch (err) {
        console.error("Error fetching logs:", err);
        this.error = "Failed to fetch logs. Please try again.";
      } finally {
        this.loading = false;
      }
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      return date.toISOString().slice(0, 16).replace("T", " ");
    },
  },
};
</script>

<style scoped>
.logs-container {
  max-width: calc(
    100% - 5cm
  ); /* Decrease the margin, effectively adding width */
  padding: 16px;
}
.analytics-container {
  border: 1px solid #ddd;
  padding: 16px;
  border-radius: 8px;
  max-width: 1100px;
  margin: auto;
}
.table-auto {
  width: 100%; /* Ensures the table takes full width of the container */
}

.table-auto th,
.table-auto td {
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  text-align: left;
}
</style>
