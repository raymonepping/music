<template>
  <div>
    <HeaderPage />

    <div class="container mx-auto mt-24 p-6">
      <h2 class="text-3xl font-bold text-center mb-8">Find Similar Music!</h2>

      <!-- Search Input -->
      <div class="text-center mb-8">
        <input
          v-model="searchQuery"
          @keyup.enter="searchForSimilarSongs"
          type="text"
          placeholder="Enter music data"
          class="border p-2 rounded w-full md:w-1/2"
        />
        <button
          @click="searchForSimilarSongs"
          class="bg-red-500 text-white px-4 py-2 rounded mt-4"
        >
          Search
        </button>
      </div>

      <!-- Filter Options -->
      <div v-if="similarSongs.length > 0" class="mb-8 text-center">
        <select v-model="selectedLanguage" class="border p-2 rounded">
          <option value="">All Languages</option>
          <option value="English">English</option>
          <option value="Dutch">Dutch</option>
          <option value="German">German</option>
          <option value="Italian">Italian</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <!-- Add more languages as needed -->
        </select>

        <input
          type="number"
          v-model.number="yearRangeStart"
          placeholder="Start Year"
          class="border p-2 rounded ml-4"
        />
        <input
          type="number"
          v-model.number="yearRangeEnd"
          placeholder="End Year"
          class="border p-2 rounded ml-4"
        />

        <button
          @click="applyFilters"
          class="bg-red-500 text-white px-4 py-2 rounded ml-4"
        >
          Apply Filters
        </button>
      </div>

      <!-- Loader -->
      <div v-if="loading" class="text-center text-lg font-medium">
        Searching for similar songs...
      </div>

      <!-- Error Message -->
      <div
        v-if="error"
        class="bg-red-100 text-red-600 p-4 rounded mb-4 text-center"
      >
        <i class="fas fa-exclamation-triangle"></i> {{ error }}
      </div>

      <!-- Similar Songs List -->
      <div
        v-if="visibleSongs.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="song in visibleSongs"
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
              <h3 class="text-xl font-bold mb-1">{{ song.song }}</h3>
              <p class="text-gray-600 mb-1">
                <strong>Artist:</strong> {{ song.artist }}
              </p>
              <p class="text-gray-600 mb-1">
                <strong>Album:</strong> {{ song.album }}
              </p>
            </div>

            <!-- Toggle Lyrics -->
            <div class="mt-1">
              <button
                class="text-black-600 font-semibold focus:outline-none hover:underline"
                @click="toggleLyrics(song.id)"
              >
                {{ showLyrics[song.id] ? "Hide" : "Show" }} Lyrics
              </button>
              <transition name="fade">
                <div
                  v-if="showLyrics[song.id]"
                  class="mt-1 p-2 bg-gray-100 rounded whitespace-pre-line text-sm"
                >
                  {{ song.lyrics }}
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>

      <!-- No Data Message -->
      <div
        v-else-if="!loading && !error"
        class="text-center text-lg font-medium"
      >
        No similar songs found.
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
  name: "SimilarityPage",
  components: { HeaderPage, Footer },
  data() {
    return {
      searchQuery: "",
      similarSongs: [], // All retrieved songs
      visibleSongs: [], // Initially visible songs
      error: null,
      loading: false,
      showLyrics: {}, // Object to track lyrics toggle state for each song
      initialLimit: 6, // Limit of songs initially shown
      selectedLanguage: "", // For language filter
      yearRangeStart: null, // Start of year range filter
      yearRangeEnd: null, // End of year range filter
    };
  },
  methods: {
    async searchForSimilarSongs() {
      if (!this.searchQuery.trim()) return;

      this.loading = true;
      this.error = null;
      this.similarSongs = [];
      this.visibleSongs = [];

      try {
        const response = await axios.get(
          `/api/similarity?songName=${encodeURIComponent(this.searchQuery)}`,
        );
        this.similarSongs = response.data.similarSongs;

        // Show only the initial limit of songs
        this.visibleSongs = this.similarSongs.slice(0, this.initialLimit);

        // Initialize showLyrics for each song with false value (closed by default)
        this.similarSongs.forEach((song) => {
          this.showLyrics[song.id] = false;
        });
      } catch (err) {
        console.error(err); // Log the error for debugging
        this.error = "Error searching for similar songs. Please try again.";
      } finally {
        this.loading = false;
      }
    },
    toggleLyrics(songId) {
      this.showLyrics[songId] = !this.showLyrics[songId]; // Toggle lyrics visibility
    },
    async applyFilters() {
      // Prepare query parameters
      const params = new URLSearchParams();
      params.append("songName", this.searchQuery);
      if (this.selectedLanguage) {
        params.append("language", this.selectedLanguage);
      }
      if (this.yearRangeStart) {
        params.append("yearRangeStart", this.yearRangeStart);
      }
      if (this.yearRangeEnd) {
        params.append("yearRangeEnd", this.yearRangeEnd);
      }

      this.loading = true;
      this.error = null;
      this.similarSongs = [];
      this.visibleSongs = [];

      try {
        const response = await axios.get(
          `/api/similarity?${params.toString()}`,
        );
        this.similarSongs = response.data.similarSongs;

        // Show only the initial limit of songs
        this.visibleSongs = this.similarSongs.slice(0, this.initialLimit);
      } catch (err) {
        console.error(err); // Log the error for debugging
        this.error = "Error applying filters. Please try again.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* Image Hover Effect */
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
