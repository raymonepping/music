<template>
  <div class="flex flex-col min-h-screen">
    <!-- Reuse AppHeader Component -->
    <AppHeader />

    <div class="container mx-auto p-6 flex-grow">
      <h2 class="text-3xl font-bold text-black text-center mb-8">
        Create New Song Document
      </h2>

      <!-- Document Form Section -->
      <div
        class="bg-gray-100 text-gray-900 rounded shadow p-6 max-w-lg mx-auto"
      >
        <form @submit.prevent="saveDocument">
          <!-- ID Field (Read-only) -->
          <div class="mb-4">
            <label class="block text-left text-gray-700">ID</label>
            <input
              v-model="document.id"
              type="text"
              class="w-full px-3 py-2 border rounded bg-gray-200"
              readonly
            />
          </div>

          <!-- Artist Field -->
          <div class="mb-4">
            <label class="block text-left text-gray-700">Artist</label>
            <input
              v-model="document.artist"
              type="text"
              class="w-full px-3 py-2 border rounded"
              placeholder="Artist Name"
              autocomplete="off"
              @input="fetchArtists"
            />
            <ul
              v-if="artistSuggestions.length"
              class="bg-white border mt-1 rounded shadow max-h-40 overflow-auto"
            >
              <li
                v-for="(artist, index) in artistSuggestions"
                :key="index"
                class="p-2 cursor-pointer hover:bg-gray-200"
                @click="selectArtist(artist)"
              >
                {{ artist }}
              </li>
            </ul>
          </div>

          <!-- Album Field -->
          <div class="mb-4">
            <label class="block text-left text-gray-700">Album</label>
            <input
              v-model="document.album"
              type="text"
              class="w-full px-3 py-2 border rounded"
              placeholder="Album Name"
            />
          </div>

          <!-- Song Field -->
          <div class="mb-4">
            <label class="block text-left text-gray-700">Song</label>
            <input
              v-model="document.song"
              type="text"
              class="w-full px-3 py-2 border rounded"
              placeholder="Song Title"
            />
          </div>

          <!-- Year Field -->
          <div class="mb-4">
            <label class="block text-left text-gray-700">Year</label>
            <input
              v-model="document.year"
              type="number"
              class="w-full px-3 py-2 border rounded"
              placeholder="Year"
            />
          </div>

          <!-- Genres Field -->
          <div class="mb-4">
            <label class="block text-left text-gray-700">Genres</label>
            <input
              v-model="document.genres"
              type="text"
              class="w-full px-3 py-2 border rounded"
              placeholder="Genres (comma-separated)"
              @input="fetchGenreSuggestions"
            />
            <ul
              v-if="genreSuggestions.length"
              class="bg-white border rounded shadow mt-2"
            >
              <li
                v-for="suggestion in genreSuggestions"
                :key="suggestion"
                class="px-3 py-1 cursor-pointer hover:bg-gray-200"
                @click="selectGenreSuggestion(suggestion)"
              >
                {{ suggestion }}
              </li>
            </ul>
          </div>

          <!-- Language Field -->
          <div class="mb-4">
            <label class="block text-left text-gray-700">Language</label>
            <input
              v-model="document.language"
              type="text"
              class="w-full px-3 py-2 border rounded"
              placeholder="Language"
              @input="fetchLanguageSuggestions"
            />
            <ul
              v-if="languageSuggestions.length"
              class="bg-white border rounded shadow mt-2"
            >
              <li
                v-for="suggestion in languageSuggestions"
                :key="suggestion"
                class="px-3 py-1 cursor-pointer hover:bg-gray-200"
                @click="selectSuggestion(suggestion)"
              >
                {{ suggestion }}
              </li>
            </ul>
          </div>

          <!-- Album Art Field -->
          <div class="mb-4">
            <label class="block text-left text-gray-700">Album Art</label>
            <input
              v-model="document.albumart"
              type="text"
              class="w-full px-3 py-2 border rounded"
              placeholder="Album Art URL"
            />
          </div>

          <!-- Lyrics Field -->
          <div class="mb-4">
            <label class="block text-left text-gray-700">Lyrics</label>
            <textarea
              v-model="document.lyrics"
              class="w-full px-3 py-2 border rounded"
              placeholder="Lyrics"
              rows="2"
            ></textarea>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="bg-red-600 text-white px-4 py-2 rounded">
            Save Document
          </button>
        </form>

        <!-- Success/Error Message -->
        <div
          v-if="message"
          :class="messageType"
          class="mt-4 p-2 rounded text-center"
        >
          {{ message }}
        </div>
      </div>
    </div>

    <!-- Reuse AppFooter Component -->
    <AppFooter />
  </div>
</template>

<script>
import axios from 'axios'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

export default {
  name: 'CreateDocument',
  components: {
    AppHeader,
    AppFooter,
  },
  data() {
    return {
      document: {
        id: null,
        meta_id: '',
        album: '',
        albumart: '',
        artist: '',
        genres: '',
        language: '',
        lyrics: '',
        song: '',
        type: 'song',
        year: null,
        date_created: new Date().toISOString(),
      },
      artistSuggestions: [], // Holds auto-complete for artists
      genreSuggestions: [], // Holds auto-complete suggestions for genres
      languageSuggestions: [], // Holds auto-complete suggestions
      debounceTimeout: null, // Timeout for debouncing
      message: '',
      messageType: '',
    }
  },
  mounted() {
    this.getNextId()
  },
  methods: {
    async fetchArtists() {
      if (this.document.artist.length < 2) return

      try {
        const response = await axios.get(`/api/music/artists`, {
          params: { query: this.document.artist },
        })
        this.artistSuggestions = response.data.artists || []
      } catch (error) {
        console.error('Error fetching artist suggestions:', error)
      }
    },
    selectArtist(artist) {
      this.document.artist = artist
      this.artistSuggestions = []
    },

    fetchGenreSuggestions() {
      clearTimeout(this.debounceTimeout)
      this.debounceTimeout = setTimeout(async () => {
        const genresArray = this.document.genres.split(',')
        const lastGenre = genresArray[genresArray.length - 1].trim()

        if (lastGenre.length > 0) {
          try {
            const response = await axios.get(`/api/music/genre-suggestions`, {
              params: { prefix: lastGenre },
            })
            this.genreSuggestions = response.data.suggestions
          } catch (error) {
            console.error('Error fetching genre suggestions:', error)
          }
        } else {
          this.genreSuggestions = []
        }
      }, 300)
    },

    // Insert the selected suggestion into the genres input field
    selectGenreSuggestion(suggestion) {
      const genresArray = this.document.genres.split(',')
      genresArray[genresArray.length - 1] = suggestion // Replace last genre with selected suggestion
      this.document.genres = genresArray.join(', ').trim() // Rejoin as a comma-separated string
      this.genreSuggestions = [] // Clear suggestions
    },

    fetchLanguageSuggestions() {
      clearTimeout(this.debounceTimeout)
      this.debounceTimeout = setTimeout(async () => {
        if (this.document.language.length > 0) {
          try {
            const response = await axios.get(
              `/api/music/language-suggestions`,
              {
                params: { prefix: this.document.language },
              },
            )
            this.languageSuggestions = response.data.suggestions
          } catch (error) {
            console.error('Error fetching language suggestions:', error)
          }
        } else {
          this.languageSuggestions = [] // Clear suggestions if input is empty
        }
      }, 300) // 300ms debounce
    },
    selectSuggestion(suggestion) {
      this.document.language = suggestion
      this.languageSuggestions = [] // Clear suggestions after selection
    },

    async getNextId() {
      try {
        const response = await axios.get('/api/music/next-id')
        if (response.data && response.data.nextId !== undefined) {
          this.document.id = response.data.nextId
          this.document.meta_id = `pg_doc_${this.document.id}`
        } else {
          throw new Error('Invalid response data')
        }
      } catch (error) {
        console.error('Error fetching next available ID:', error)
        this.showMessage('Error fetching ID. Please try again.', 'error')
      }
    },
    async saveDocument() {
      try {
        // Ensure genres are an array
        if (typeof this.document.genres === 'string') {
          this.document.genres = this.document.genres
            .split(',')
            .map((genre) => genre.trim())
        }

        await axios.post('/api/music', this.document)
        this.showMessage('Document saved successfully!', 'success')

        // Reset the form after 3 seconds
        setTimeout(() => {
          this.resetForm()
        }, 3000)
      } catch (error) {
        this.showMessage('Error saving document. Please try again.', 'error')
        console.error('Error saving document:', error)
      }
    },
    showMessage(msg, type) {
      this.message = msg
      this.messageType =
        type === 'success'
          ? 'bg-green-200 text-green-800'
          : 'bg-red-200 text-red-800'

      // Clear message after 3 seconds
      setTimeout(() => {
        this.message = ''
      }, 3000)
    },
    resetForm() {
      this.document = {
        id: null,
        meta_id: '',
        album: '',
        albumart: '',
        artist: '',
        genres: '',
        language: '',
        lyrics: '',
        song: '',
        type: 'song',
        year: null,
        date_created: new Date().toISOString(),
      }
      this.getNextId()
    },
  },
}
</script>

<style scoped>
.bg-red-600 {
  background-color: rgb(235, 0, 0);
}

textarea {
  min-height: 200px; /* Minimum height for more comfortable lyrics editing */
}

.bg-green-200 {
  background-color: #e6ffed;
}

.text-green-800 {
  color: #065f46;
}

.bg-red-200 {
  background-color: #fde2e1;
}

.text-red-800 {
  color: #7f1d1d;
}

.flex-grow {
  flex-grow: 1;
}
</style>
