<template>
  <div class="flex flex-col min-h-screen">
    <!-- Global Header -->
    

    <!-- Main Container -->
    <div class="container mx-auto mt-24 p-6 text-center flex-grow">
      <h1 class="text-3xl font-bold text-black text-center mb-8">
        Music Vector Visualization
      </h1>

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
      <div v-if="musicVectors.length > 0" class="scatter-container">
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

    <!-- Global Footer -->
    
  </div>
</template>

<script>
import axios from 'axios'
// import AppHeader from '~/components/AppHeader.vue'
// import AppFooter from '~/components/AppFooter.vue'
import MusicScatterPlot from '~/components/MusicScatterPlot.vue'

export default {
  name: 'VectorPlotPage',
  components: { MusicScatterPlot },
  data() {
    return {
      musicVectors: [],
      error: null,
      loading: false,
    }
  },
  mounted() {
    this.loadMusicVectors() // Load music vectors when the page loads
  },
  methods: {
    async loadMusicVectors() {
      this.loading = true
      this.error = null

      try {
        const response = await axios.get(`/api/vectors/music-vectors`)
        this.musicVectors = response.data
      } catch (err) {
        console.error(err)
        this.error = 'Error fetching music vectors. Please try again.'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
/* Ensuring there is no unnecessary whitespace around the scatter plot */
.scatter-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: calc(
    100vh - 200px
  ); /* Reduce the height to prevent excess white space */
}
</style>
