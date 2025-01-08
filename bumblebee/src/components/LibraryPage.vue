<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header Component -->
    <HeaderPage />

    <!-- Main Container -->
    <div class="container mx-auto mt-24 p-6 text-center flex-grow">
      <h1 class="text-3xl font-bold text-black text-center mb-8">
        Library Search
      </h1>

      <!-- Search Options Section -->
      <div
        class="flex flex-col items-center justify-start bg-gray-100 text-gray-900 rounded shadow p-6 max-w-lg mx-auto"
      >
        <p class="text-gray-600 mb-4">
          This is the Library Page where you can search for artists, albums,
          songs and full-text.
        </p>

        <!-- Search Input Fields -->
        <div class="w-full space-y-4">
          <!-- Artist Search -->
          <div>
            <label for="artist" class="block text-left text-gray-700"
              >Artist:</label
            >
            <input
              type="text"
              id="artist"
              v-model="artist"
              placeholder="Enter artist name"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <!-- Album Search -->
          <div>
            <label for="album" class="block text-left text-gray-700"
              >Album:</label
            >
            <input
              type="text"
              id="album"
              v-model="album"
              placeholder="Enter album name"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <!-- Song Search -->
          <div>
            <label for="song" class="block text-left text-gray-700"
              >Song:</label
            >
            <input
              type="text"
              id="song"
              v-model="song"
              placeholder="Enter song title"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <!-- Full-Text Search -->
          <div>
            <label for="fulltext" class="block text-left text-gray-700"
              >Full-Text:</label
            >
            <input
              type="text"
              id="fulltext"
              v-model="fulltext"
              placeholder="Enter full-text search"
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <!-- Search Button -->
          <button
            @click="performSearch"
            class="w-full mt-4 py-2 bg-primary text-white font-semibold rounded hover:bg-brightred transition duration-300"
          >
            Search
          </button>
        </div>
      </div>

      <!-- Search Results Section -->
      <div v-if="musicData.length > 0" class="mt-8">
        <h2 class="text-2xl font-bold text-center mb-4">Search Results</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="item in musicData"
            :key="item.id"
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
                  {{ item.song || "Unknown Song" }}
                </h3>
                <p class="text-gray-600 mb-1">
                  <strong>Artist:</strong> {{ item.artist || "Unknown Artist" }}
                </p>
                <p class="text-gray-600 mb-1">
                  <strong>Album:</strong> {{ item.album || "Unknown Album" }}
                </p>
              </div>
              <div class="mt-1">
                <button
                  class="text-black-600 font-semibold focus:outline-none hover:underline"
                  @click="toggleLyrics(item.id)"
                >
                  {{ showLyrics[item.id] ? "Hide" : "Show" }} Lyrics
                </button>
                <transition name="fade">
                  <div
                    v-if="showLyrics[item.id]"
                    class="mt-1 p-2 bg-gray-100 rounded whitespace-pre-line text-sm"
                  >
                    {{ item.lyrics || "No Lyrics Available" }}
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Data Message -->
      <div
        v-else-if="!loading && !error && !musicData.length"
        class="text-center text-lg font-medium mt-8"
      >
        No music data available.
      </div>

      <!-- Loader -->
      <div v-if="loading" class="text-center text-lg font-medium mt-8">
        Loading music data...
      </div>

      <!-- Error Message -->
      <div
        v-if="error && !musicData.length"
        class="bg-red-100 text-red-600 p-4 rounded mb-4 text-center mt-8"
      >
        <i class="fas fa-exclamation-triangle"></i> {{ error }}
      </div>
    </div>

    <!-- Footer Component -->
    <Footer />
  </div>
</template>

<script>
import axios from "axios";
import HeaderPage from "./HeaderPage.vue";
import Footer from "./Footer.vue";

export default {
  name: "LibraryPage",
  components: {
    HeaderPage,
    Footer,
  },
  data() {
    return {
      artist: "", // Model for artist search
      album: "", // Model for album search
      song: "", // Model for song search
      fulltext: "", // Model for full-text search
      musicData: [], // Array to store the music data
      error: null,
      loading: false,
      showLyrics: {}, // Object to track lyrics toggle state for each song
    };
  },
  methods: {
    async performSearch() {
      try {
        this.loading = true;
        this.error = null;
        this.musicData = [];

        // Check if any search field is filled
        if (!this.artist && !this.album && !this.song && !this.fulltext) {
          this.error = "Please fill at least one search field.";
          this.loading = false;
          return;
        }

        // Determine the search type and construct the payload accordingly
        let searchType = "";
        let searchPayload = {};

        if (this.fulltext) {
          // Use fulltext-search if fulltext is provided
          searchType = "fulltext-search";
          searchPayload.fulltext = this.fulltext;
        } else {
          // Use appropriate search endpoint based on fields filled
          if (this.artist) {
            searchType = "artist-search";
            searchPayload.artist = this.artist;
          }
          if (this.album) {
            searchType = "album-search";
            searchPayload.album = this.album;
          }
          if (this.song) {
            searchType = "song-search";
            searchPayload.song = this.song;
          }
        }

        // Log the search payload for debugging
        console.log("Search payload:", searchPayload);

        // Fetch the music data from the backend
        const response = await axios.post(
          `/api/library/${searchType}`,
          searchPayload,
        );

        // Log the response for debugging
        console.log("API Response:", response.data);

        if (response.data.musicData) {
          // Check if the data format is different between FTS and regular search and normalize accordingly
          this.musicData = response.data.musicData.map((item) => ({
            id: item.id || item.music?.id || "Unknown",
            artist: item.artist || item.music?.artist || "Unknown Artist",
            album: item.album || item.music?.album || "Unknown Album",
            song: item.song || item.music?.song || "Unknown Song",
            albumart: item.albumart || item.music?.albumart || null,
            lyrics: item.lyrics || item.music?.lyrics || "No Lyrics Available",
          }));

          // Initialize showLyrics for each song with false value
          this.musicData.forEach((item) => {
            this.showLyrics[item.id] = false; // Hide lyrics by default
          });
          console.log("Show Lyrics State:", this.showLyrics); // Debugging log
        } else {
          this.error = response.data.error || "No matching documents found.";
        }
      } catch (err) {
        console.error("Error performing search:", err);
        this.error =
          err.response && err.response.data && err.response.data.message
            ? err.response.data.message
            : "An error occurred while performing the search. Please try again.";
      } finally {
        this.loading = false;
      }
    },
    formatDate(timestamp) {
      if (!timestamp) return "Invalid Date";
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString(); // Format the timestamp to a human-readable date
    },
    toggleLyrics(songId) {
      if (this.showLyrics[songId] !== undefined) {
        this.showLyrics[songId] = !this.showLyrics[songId];
      } else {
        // Initialize the value if it doesn't exist yet
        this.showLyrics = { ...this.showLyrics, [songId]: true };
      }
      console.log(
        "Toggled Lyrics for:",
        songId,
        "State:",
        this.showLyrics[songId],
      ); // Debugging log
    },
  },
};
</script>

<style scoped>
/* Styling adjustments for the LibraryPage */

.album-art {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease; /* Smooth transition for transform and box-shadow */
}

.album-art:hover {
  transform: scale(1.05); /* Slightly increase the size */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3); /* Add a shadow effect */
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
