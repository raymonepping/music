<template>
  <div class="scatter-container">
    <div ref="scatterPlot" class="scatter-plot"></div>
  </div>
</template>

<script>
import Plotly from 'plotly.js-dist'

export default {
  name: 'MusicScatterPlot',
  props: {
    musicData: {
      type: Array,
      required: true,
    },
  },
  mounted() {
    this.createScatterPlot()
  },
  methods: {
    createScatterPlot() {
      // Create a map to group songs by artist and count their occurrences
      const artistMap = {}

      this.musicData.forEach((song) => {
        const artistKey = song.artist
        if (!artistMap[artistKey]) {
          artistMap[artistKey] = {
            count: 0,
            songs: [],
            vector: song.music_vector, // Assume the first song's vector represents the artist
          }
        }
        artistMap[artistKey].count += 1
        artistMap[artistKey].songs.push(song.song)
      })

      // Prepare the data for the scatter plot
      const xValues = []
      const yValues = []
      const zValues = []
      const textLabels = []
      const sizes = [] // To store the size of the dots based on song count

      Object.keys(artistMap).forEach((artist) => {
        const artistData = artistMap[artist]
        xValues.push(artistData.vector[0]) // X-axis: genre vector
        yValues.push(artistData.vector[1]) // Y-axis: language vector
        zValues.push(artistData.vector[2]) // Z-axis: year vector
        textLabels.push(`${artist}<br>${artistData.songs.join('<br>')}`) // Artist and all songs
        sizes.push(5 + artistData.count * 5) // Base size 5, increase by 5 per song
      })

      const data = [
        {
          x: xValues,
          y: yValues,
          z: zValues,
          mode: 'markers',
          type: 'scatter3d', // 3D scatter plot
          text: textLabels,
          marker: {
            size: sizes, // Size based on the number of songs by the artist
            color: zValues, // Using the z (year) value to color the points
            colorscale: 'Inferno',
            reversescale: true, // Reverse the color scale
            opacity: 0.8,
          },
          hoverinfo: 'text', // Show the artist and their songs on hover
        },
      ]

      const layout = {
        scene: {
          xaxis: { title: 'Genre' },
          yaxis: { title: 'Language' },
          zaxis: { title: 'Year' },
        },
        margin: { l: 0, r: 0, b: 0, t: 0 },
        showlegend: false,
        autosize: true, // Enable autosizing to fit the container
      }

      Plotly.newPlot(this.$refs.scatterPlot, data, layout)

      // Disable interaction: rotation, zoom, and drag
      Plotly.relayout(this.$refs.scatterPlot, {
        'scene.dragmode': false,
        'scene.camera.zoom': false,
        'scene.xaxis.fixedrange': true,
        'scene.yaxis.fixedrange': true,
        'scene.zaxis.fixedrange': true,
      })

      // Make the plot responsive
      window.addEventListener('resize', () => {
        Plotly.Plots.resize(this.$refs.scatterPlot)
      })
    },
  },
}
</script>

<style scoped>
.scatter-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: calc(100vh - 100px); /* Adjust height to move the graph up */
  margin-top: -30px; /* Move the graph up by 30px (3cm approx) */
}

.scatter-plot {
  width: 90%;
  height: 90%;
  max-width: 1200px; /* Max size for larger screens */
  max-height: 1200px; /* Max height for larger screens */
  margin: 0 auto; /* Center the chart horizontally */
}
</style>
