<template>
  <div class="flex flex-col min-h-screen">
    <!-- AppHeader Component -->
    

    <!-- Main Container -->
    <div class="container mx-auto mt-24 p-6 text-center flex-grow">
      <h2 class="text-3xl font-bold text-center mb-8">Music Data</h2>

      <!-- Loader -->
      <div v-if="loading" class="text-center text-lg font-medium">
        Loading music data...
      </div>

      <!-- Error Message -->
      <div
        v-if="error"
        class="bg-red-100 text-red-600 p-4 rounded mb-4 text-center"
      >
        <i class="fas fa-exclamation-triangle"></i> {{ error }}
      </div>

      <!-- Data List -->
      <div
        v-if="!loading && !error && musicData.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="item in musicData"
          :key="item.id || Math.random()"
          class="bg-white p-4 rounded shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out"
        >
          <img
            v-if="item.albumart"
            :src="item.albumart"
            alt="Album Art"
            class="w-full h-48 object-cover rounded-t mb-2 album-art"
          />
          <div class="flex flex-col justify-start h-full text-left">
            <div class="mb-2">
              <h3 class="text-xl font-bold mb-1">
                {{ item.song || 'Unknown Song' }}
              </h3>
              <p class="text-gray-600 mb-1">
                <strong>Artist:</strong> {{ item.artist || 'Unknown Artist' }}
              </p>
              <p class="text-gray-600 mb-1">
                <strong>Album:</strong> {{ item.album || 'Unknown Album' }}
              </p>
            </div>
            <div class="mt-1">
              <button
                v-if="item.id"
                class="text-black-600 font-semibold focus:outline-none hover:underline"
                @click="toggleLyrics(item.id)"
              >
                {{ showLyrics[item.id] ? 'Hide' : 'Show' }} Lyrics
              </button>
              <transition name="fade">
                <div
                  v-if="showLyrics[item.id]"
                  class="mt-1 p-2 bg-gray-100 rounded whitespace-pre-line text-sm"
                >
                  {{ item.lyrics || 'Lyrics not available' }}
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>

      <!-- No Data Message -->
      <div
        v-else-if="!loading && !error && musicData.length === 0"
        class="text-center text-lg font-medium"
      >
        No music data available.
      </div>

      <!-- Pagination Controls -->
      <div class="flex justify-center mt-8">
        <button
          :disabled="currentPage === 1"
          class="px-4 py-2 mx-1 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed w-32"
          @click="fetchMusicData(currentPage - 1)"
        >
          Previous
        </button>
        <button
          :disabled="currentPage === totalPages"
          class="px-4 py-2 mx-1 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed w-32"
          @click="fetchMusicData(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>

    <!-- AppFooter Component -->
    
  </div>
</template>

<script>
import axios from 'axios'
// import AppHeader from '@/components/AppHeader.vue'
// import AppFooter from '@/components/AppFooter.vue'

export default {
  name: 'MusicPage',
  components: {
    // AppHeader,
    // AppFooter,
  },
  data() {
    return {
      musicData: [],
      error: null,
      loading: false,
      showLyrics: {},
      currentPage: 1,
      pageSize: 6,
      totalPages: 1,
    }
  },
  created() {
    this.fetchMusicData(this.currentPage)
  },
  methods: {
    async fetchMusicData(page) {
      if (page < 1 || page > this.totalPages) return

      this.loading = true
      this.error = null
      this.musicData = []

      try {
        const response = await axios.get(
          `/api/music?page=${page}&pageSize=${this.pageSize}`,
        )

        if (response.data && response.data.musicData) {
          this.musicData = response.data.musicData
          this.currentPage = response.data.currentPage
          this.totalPages = response.data.totalPages

          this.musicData.forEach((item) => {
            this.$set(this.showLyrics, item.id, false)
          })
        } else {
          this.error =
            'Unexpected response format. Check API response structure.'
        }
      } catch (err) {
        this.error = `Error fetching music data: ${err.message || err}`
      } finally {
        this.loading = false
      }
    },
    toggleLyrics(songId) {
      if (songId) {
        this.$set(this.showLyrics, songId, !this.showLyrics[songId])
      }
    },
  },
}
</script>

<style scoped>
.album-art {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.album-art:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.flex-grow {
  flex-grow: 1;
}
</style>
