<template>
  <div>
    <div ref="scatterPlot" class="scatter-plot"></div>
  </div>
</template>

<script>
import Plotly from "plotly.js-dist";

export default {
  name: "MusicScatterPlot",
  props: {
    musicData: {
      type: Array,
      required: true,
    },
  },
  mounted() {
    this.createScatterPlot();
  },
  methods: {
    createScatterPlot() {
      const artistMap = {};

      // Grouping songs by artist
      this.musicData.forEach((song) => {
        const artistKey = song.artist;
        if (!artistMap[artistKey]) {
          artistMap[artistKey] = {
            count: 0,
            songs: [],
            vector: song.music_vector,
          };
        }
        artistMap[artistKey].count += 1;
        artistMap[artistKey].songs.push(song.song);
      });

      // Prepare data for the scatter plot
      const xValues = [];
      const yValues = [];
      const zValues = [];
      const textLabels = [];
      const sizes = [];

      Object.keys(artistMap).forEach((artist) => {
        const artistData = artistMap[artist];
        xValues.push(artistData.vector[0]);
        yValues.push(artistData.vector[1]);
        zValues.push(artistData.vector[2]);
        textLabels.push(`${artist}<br>${artistData.songs.join("<br>")}`);
        sizes.push(6 + artistData.count * 4);
      });

      const data = [
        {
          x: xValues,
          y: yValues,
          z: zValues,
          mode: "markers",
          type: "scatter3d",
          text: textLabels,
          marker: {
            size: sizes,
            color: zValues,
            colorscale: "Inferno",
            reversescale: true, // Reverse the color scale
            opacity: 0.8,
          },
          hoverinfo: "text",
        },
      ];

      const layout = {
        scene: {
          xaxis: { title: "Genre" },
          yaxis: { title: "Language" },
          zaxis: { title: "Year" },
          dragmode: false, // Disable dragging (rotation)
          camera: {
            up: { x: 0, y: 0, z: 1 }, // Fix the 'up' vector
            eye: { x: 1.5, y: 1.5, z: 1.5 }, // Set a static camera view
          },
        },
        margin: { l: 0, r: 0, b: 0, t: 0 },
        showlegend: false,
        autosize: true,
      };

      Plotly.newPlot(this.$refs.scatterPlot, data, layout);

      // Make the plot responsive
      window.addEventListener("resize", () => {
        Plotly.Plots.resize(this.$refs.scatterPlot);
      });
    },
  },
};
</script>

<style scoped>
.scatter-plot {
  width: 95%;
  max-width: 1200px; /* Increased the max width */
  height: 80vh; /* Increased the height */
  margin: 0 auto; /* Center the graph */
}
</style>
