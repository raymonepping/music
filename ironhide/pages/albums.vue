<template>
  <div class="flex flex-col min-h-screen">
    <!-- AppHeader Component -->
    

    <!-- Main Container -->
    <div class="container mx-auto mt-24 p-6 text-center flex-grow">
      <h2 class="text-3xl font-bold text-center mb-8">Album Data</h2>

      <!-- Loader -->
      <div v-if="loading" class="text-center text-lg font-medium">
        Loading album data...
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
        v-if="albumData.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="album in albumData"
          :key="album.id"
          class="bg-white p-4 rounded shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out"
        >
          <!-- Album Art with Fallback to Default Image -->
          <img
            :src="album.albumart || defaultAlbumArt"
            alt="Album Art"
            class="w-full h-48 object-cover rounded-t mb-2 album-art"
            @error="onImageError"
          />

          <div class="flex flex-col justify-start h-full text-left">
            <div class="mb-2">
              <h3 class="text-xl font-bold mb-1">{{ album.album }}</h3>
              <p class="text-gray-600 mb-1">
                <strong>Artist:</strong> {{ album.artist }}
              </p>

              <!-- Show editable fields in edit mode -->
              <div v-if="isEditing">
                <p class="text-gray-600 mb-1">
                  <strong>Year:</strong>
                  <input
                    v-model="album.year"
                    type="text"
                    class="border border-gray-400 p-2 w-full rounded"
                    placeholder="Enter Year"
                  />
                </p>

                <p class="text-gray-600 mb-1">
                  <strong>Album Art URL:</strong>
                  <input
                    v-model="album.albumart"
                    type="text"
                    class="border border-gray-400 p-2 w-full rounded"
                    placeholder="Enter Album Art URL"
                  />
                </p>

                <!-- Save Button -->
                <button
                  class="bg-green-500 text-white px-4 py-2 mt-2 rounded"
                  @click="updateAlbum(album)"
                >
                  Save Changes
                </button>
              </div>

              <!-- Display fields in view mode -->
              <div v-else>
                <p class="text-gray-600 mb-1">
                  <strong>Year:</strong> {{ album.year }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Data Message -->
      <div
        v-else-if="!loading && !error"
        class="text-center text-lg font-medium"
      >
        No album data available.
      </div>

      <!-- Pagination Controls -->
      <div class="flex justify-center mt-8">
        <button
          :disabled="currentPage === 1"
          class="px-4 py-2 mx-1 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed w-32"
          @click="fetchAlbumData(currentPage - 1)"
        >
          Previous
        </button>
        <button
          :disabled="currentPage === totalPages"
          class="px-4 py-2 mx-1 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed w-32"
          @click="fetchAlbumData(currentPage + 1)"
        >
          Next
        </button>
      </div>

      <!-- Toggle Edit/View Mode Button -->
      <div class="flex justify-center mt-4">
        <button
          class="bg-red-500 text-white px-4 py-2 rounded"
          @click="isEditing = !isEditing"
        >
          {{ isEditing ? 'Switch to View Mode' : 'Switch to Edit Mode' }}
        </button>
      </div>
    </div>

    <!-- AppFooter Component -->
    
  </div>
</template>

<script>
import axios from 'axios'

// Import the AppHeader and AppFooter components
// import AppHeader from '@/components/AppHeader.vue'
// import AppFooter from '@/components/AppFooter.vue'

// Import the default album art image
import defaultAlbumArt from '@/assets/default_album_art.jpg'

export default {
  name: 'AlbumPage',
  components: {
    // AppHeader,
    // AppFooter,
  },
  data() {
    return {
      albumData: [],
      error: null,
      loading: false,
      currentPage: 1,
      pageSize: 6,
      totalPages: 1,
      defaultAlbumArt,
      saveStatus: {}, // Store feedback status per album
      isEditing: false, // Controls whether edit mode is enabled or disabled
    }
  },
  created() {
    this.fetchAlbumData(this.currentPage)
  },
  methods: {
    async fetchAlbumData(page) {
      if (page < 1 || page > this.totalPages) return

      this.loading = true
      this.error = null
      this.albumData = []

      try {
        const response = await axios.get(
          `/api/albums?page=${page}&pageSize=${this.pageSize}`,
        )
        if (response.data && response.data.albumData) {
          this.albumData = response.data.albumData
          this.currentPage = response.data.currentPage
          this.totalPages = response.data.totalPages
        } else {
          this.error =
            'Unexpected response format. Check API response structure.'
        }
      } catch (err) {
        this.error = `Error fetching album data from Couchbase: ${
          err.message || err
        }`
      } finally {
        this.loading = false
      }
    },
    async updateAlbum(album) {
      this.saveStatus[album.id] = null // Reset save status before making a new request
      try {
        const response = await axios.put(`/api/albums/${album.id}`, {
          year: album.year,
          release_date: album.release_date,
          albumart: album.albumart,
        })

        if (response.data.success) {
          this.saveStatus[album.id] = 'Changes saved!'
          this.$forceUpdate() // Refresh the UI to reflect the updated data
        } else {
          this.saveStatus[album.id] = 'Failed to save changes.'
        }
      } catch (err) {
        console.error('Error updating album:', err)
        this.error = `Error updating album: ${err.message || err}`
        this.saveStatus[album.id] = 'Error saving changes.'
      }

      // Optionally clear the status message after a few seconds
      setTimeout(() => {
        this.saveStatus[album.id] = null
      }, 3000) // Reset after 3 seconds
    },
    onImageError(event) {
      event.target.src = this.defaultAlbumArt
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

.flex-grow {
  flex-grow: 1;
}
</style>
