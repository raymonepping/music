<template>
  <div class="flex flex-col min-h-screen">
    <!-- Global Header -->
    

    <!-- Main Container -->
    <div class="container mx-auto mt-24 p-6 text-center flex-grow">
      <h1 class="text-3xl font-bold text-black text-center mb-8">
        Find Similar Music!
      </h1>

      <!-- Search Input Section -->
      <div
        class="flex flex-col items-center justify-start bg-gray-100 text-gray-900 rounded shadow p-6 max-w-lg mx-auto"
      >
        <p class="text-gray-600 mb-4">
          Enter the name of a song to find similar songs.
        </p>

        <!-- Search Input -->
        <div class="w-full space-y-4">
          <div>
            <label for="songName" class="block text-left text-gray-700"
              >Song:</label
            >
            <input
              id="songName"
              v-model="searchQuery"
              type="text"
              placeholder="Enter song name"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <!-- Search Button -->
          <button
            class="w-full mt-4 py-2 bg-primary text-white font-semibold rounded hover:bg-brightred transition duration-300"
            @click="performSearch"
          >
            Search
          </button>
        </div>
      </div>

      <!-- Filter Options Section -->
      <div v-if="similarSongs.length > 0" class="mt-8">
        <select v-model="selectedLanguage" class="border p-2 rounded">
          <option value="">All Languages</option>
          <option value="English">English</option>
          <option value="Dutch">Dutch</option>
          <option value="Italian">Italian</option>
          <option value="German">German</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
        </select>

        <input
          v-model.number="yearRangeStart"
          type="number"
          placeholder="Start Year"
          class="border p-2 rounded ml-4"
        />
        <input
          v-model.number="yearRangeEnd"
          type="number"
          placeholder="End Year"
          class="border p-2 rounded ml-4"
        />

        <button
          class="bg-red-500 text-white px-4 py-2 rounded ml-4"
          @click="applyFilters"
        >
          Apply Filters
        </button>
      </div>

      <!-- Search Results Section -->
      <div v-if="similarSongs.length > 0" class="mt-8">
        <h2 class="text-2xl font-bold text-center mb-4">Search Results</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="song in similarSongs"
            :key="song.id"
            class="bg-white p-4 rounded shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out"
          >
            <img
              v-if="song.albumart"
              :src="song.albumart"
              alt="Album Art"
              class="w-full h-48 object-cover rounded-t mb-2 album-art"
            />
            <div class="flex flex-col justify-start h-full text-left">
              <div class="mb-2">
                <h3 class="text-xl font-bold mb-1">
                  {{ song.song || 'Unknown Song' }}
                </h3>
                <p class="text-gray-600 mb-1">
                  <strong>Artist:</strong> {{ song.artist || 'Unknown Artist' }}
                </p>
                <p class="text-gray-600 mb-1">
                  <strong>Album:</strong> {{ song.album || 'Unknown Album' }}
                </p>
              </div>

              <!-- Toggle Lyrics -->
              <div class="mt-1">
                <button
                  class="text-black-600 font-semibold focus:outline-none hover:underline"
                  @click="toggleLyrics(song.id)"
                >
                  {{ showLyrics[song.id] ? 'Hide' : 'Show' }} Lyrics
                </button>
                <transition name="fade">
                  <div
                    v-if="showLyrics[song.id]"
                    class="mt-1 p-2 bg-gray-100 rounded whitespace-pre-line text-sm"
                  >
                    {{ song.lyrics || 'No Lyrics Available' }}
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Data Message -->
      <div
        v-else-if="!loading && !error && !similarSongs.length"
        class="text-center text-lg font-medium mt-8"
      >
        No similar songs found.
      </div>

      <!-- Loader -->
      <div v-if="loading" class="text-center text-lg font-medium mt-8">
        Searching for similar songs...
      </div>

      <!-- Error Message -->
      <div
        v-if="error && !similarSongs.length"
        class="bg-red-100 text-red-600 p-4 rounded mb-4 text-center mt-8"
      >
        <i class="fas fa-exclamation-triangle"></i> {{ error }}
      </div>
    </div>

    <!-- Global Footer -->
    
  </div>
</template>

<script>
import axios from 'axios'
// import AppHeader from '~/components/AppHeader.vue'
// import AppFooter from '~/components/AppFooter.vue'

export default {
  name: 'SimilarityPage',
  components: {
    // AppHeader,
    // AppFooter,
  },
  data() {
    return {
      searchQuery: '', // Model for song name search
      similarSongs: [], // Array to store the similar songs data
      error: null,
      loading: false,
      showLyrics: {}, // Object to track lyrics toggle state for each song
      selectedLanguage: '', // Language filter
      yearRangeStart: null, // Start of year range filter
      yearRangeEnd: null, // End of year range filter
    }
  },
  methods: {
    async performSearch() {
      try {
        this.loading = true
        this.error = null
        this.similarSongs = []

        // Ensure that the search field is not empty
        if (!this.searchQuery.trim()) {
          this.error = 'Please enter a song name.'
          this.loading = false
          return
        }

        // Perform the API request
        const response = await axios.get(
          `/api/similarity?songName=${encodeURIComponent(this.searchQuery)}`,
        )

        if (response.data.similarSongs) {
          // Limit the results to 6 songs
          this.similarSongs = response.data.similarSongs
            .map((item) => ({
              id: item.id || 'Unknown',
              artist: item.artist || 'Unknown Artist',
              album: item.album || 'Unknown Album',
              song: item.song || 'Unknown Song',
              albumart: item.albumart || null,
              lyrics: item.lyrics || 'No Lyrics Available',
            }))
            .slice(0, 6) // Limit to 6 songs
          // Initialize showLyrics for each song with false value (closed by default)
          this.similarSongs.forEach((song) => {
            this.$set(this.showLyrics, song.id, false)
          })
        } else {
          this.error = response.data.error || 'No similar songs found.'
        }
      } catch (err) {
        this.error =
          err.response?.data?.message ||
          'Error searching for similar songs. Please try again.'
        console.error('Error fetching similar songs:', err)
      } finally {
        this.loading = false
      }
    },

    async applyFilters() {
      // Prepare query parameters
      const params = new URLSearchParams()
      params.append('songName', this.searchQuery)
      if (this.selectedLanguage) {
        params.append('language', this.selectedLanguage)
      }
      if (this.yearRangeStart) {
        params.append('yearRangeStart', this.yearRangeStart)
      }
      if (this.yearRangeEnd) {
        params.append('yearRangeEnd', this.yearRangeEnd)
      }

      try {
        this.loading = true
        this.error = null
        this.similarSongs = []

        // Perform the API request with filters
        const response = await axios.get(`/api/similarity?${params.toString()}`)

        if (response.data.similarSongs) {
          // Limit the results to 6 songs
          this.similarSongs = response.data.similarSongs
            .map((item) => ({
              id: item.id || 'Unknown',
              artist: item.artist || 'Unknown Artist',
              album: item.album || 'Unknown Album',
              song: item.song || 'Unknown Song',
              albumart: item.albumart || null,
              lyrics: item.lyrics || 'No Lyrics Available',
            }))
            .slice(0, 6) // Limit to 6 songs

          // Initialize showLyrics for each song with false value (closed by default)
          this.similarSongs.forEach((song) => {
            this.$set(this.showLyrics, song.id, false)
          })
        } else {
          this.error = response.data.error || 'No similar songs found.'
        }
      } catch (err) {
        this.error =
          err.response?.data?.message ||
          'Error applying filters. Please try again.'
        console.error('Error applying filters:', err)
      } finally {
        this.loading = false
      }
    },

    toggleLyrics(songId) {
      if (this.showLyrics[songId] !== undefined) {
        this.showLyrics[songId] = !this.showLyrics[songId]
      } else {
        // Initialize the value if it doesn't exist yet
        this.$set(this.showLyrics, songId, true)
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

/* Transition Effect for Collapsing Lyrics */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
