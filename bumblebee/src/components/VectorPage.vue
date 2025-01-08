<template>
  <div class="flex flex-col min-h-screen">
    <HeaderPage />

    <div class="container mx-auto mt-8 p-6 text-center flex-grow">
      <h2 class="text-3xl font-bold text-center mb-4">
        Music Vector Visualization
      </h2>

      <!-- Loader -->
      <div v-if="loading" class="text-center text-lg font-medium">
        Loading music vectors...
      </div>

      <!-- Error Message -->
      <div
        v-if="error"
        class="bg-red-100 text-red-600 p-4 rounded mb-4 text-center"
      >
        <i class="fas fa-exclamation-triangle"></i> {{ error }}
      </div>

      <!-- Scatter Plot Component -->
      <div v-if="musicVectors.length > 0">
        <MusicScatterPlot :music-data="musicVectors" />
      </div>

      <!-- No Data Message -->
      <div
        v-else-if="!loading && !error"
        class="text-center text-lg font-medium"
      >
        No vectors found.
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
import axios from "axios";
import HeaderPage from "./HeaderPage.vue";
import Footer from "./Footer.vue";
import MusicScatterPlot from "./MusicScatterPlot.vue";

export default {
  name: "VectorPlotPage",
  components: { HeaderPage, Footer, MusicScatterPlot },
  data() {
    return {
      musicVectors: [],
      error: null,
      loading: false,
    };
  },
  mounted() {
    this.loadMusicVectors(); // Load music vectors when the page loads
  },
  methods: {
    async loadMusicVectors() {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get(`/api/vectors/music-vectors`);
        this.musicVectors = response.data;
      } catch (err) {
        console.error(err);
        this.error = "Error fetching music vectors. Please try again.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* Removed excessive margin and adjusted the layout */
.container {
  margin-top: 1cm;
}

.flex-grow {
  margin-bottom: 1cm;
}
</style>
