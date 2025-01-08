<template>
  <div>
    <div class="container mx-auto mt-16 p-4 sm:p-6">
      <h2 class="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
        This one? or That one! - the Music Game
      </h2>

      <!-- Loader -->
      <div v-if="loading" class="text-center text-base sm:text-lg font-medium">
        Loading game...
      </div>

      <!-- Error Message -->
      <div
        v-if="error"
        class="bg-red-100 text-red-600 p-4 rounded mb-4 text-center"
      >
        <i class="fas fa-exclamation-triangle"></i> {{ error }}
      </div>

      <!-- Username Input and Start Button -->
      <div v-if="!gameStarted" class="text-center mb-6 sm:mb-8">
        <input
          v-model="username"
          type="text"
          placeholder="Enter your name"
          class="p-2 border border-gray-300 rounded-md w-full max-w-xs mb-4"
        />
        <button
          class="px-4 py-2 bg-red-500 text-white text-sm sm:text-base rounded hover:bg-red-600"
          @click="startGame"
        >
          Start Game
        </button>
      </div>

      <!-- Progress Bar -->
      <div v-if="gameStarted && !completed" class="mt-4 sm:mt-6">
        <div class="w-full bg-gray-300 rounded-full h-3 sm:h-4">
          <div
            class="bg-green-500 h-full rounded-full transition-width duration-300"
            :style="{ width: progressBarWidth + '%' }"
          ></div>
        </div>
        <p class="text-center mt-2 text-sm sm:text-base">
          Round {{ currentRound }} of 10
        </p>
      </div>

      <!-- Game Content -->
      <div
        v-if="gameStarted && songs.length === 2"
        class="flex flex-col sm:flex-row justify-around mt-6 sm:mt-8"
      >
        <!-- First Song -->
        <div
          class="bg-white p-4 rounded shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer w-full sm:w-1/3 mb-4 sm:mb-0"
          @click="selectSong(songs[0].id, songs[1].id)"
        >
          <img
            v-if="songs[0].albumart"
            :src="songs[0].albumart"
            alt="Album Art"
            class="w-full h-24 sm:h-48 object-cover rounded-t mb-2"
          />
          <h3 class="text-lg sm:text-xl font-bold mb-1">{{ songs[0].song }}</h3>
          <p class="text-gray-600 text-sm sm:text-base mb-1">
            <strong>Artist:</strong> {{ songs[0].artist }}
          </p>
          <p class="text-gray-600 text-sm sm:text-base mb-1">
            <strong>Album:</strong> {{ songs[0].album }}
          </p>
        </div>

        <!-- VS Divider -->
        <div
          class="flex items-center justify-center text-2xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-0"
        >
          VS
        </div>

        <!-- Second Song -->
        <div
          class="bg-white p-4 rounded shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out cursor-pointer w-full sm:w-1/3"
          @click="selectSong(songs[1].id, songs[0].id)"
        >
          <img
            v-if="songs[1].albumart"
            :src="songs[1].albumart"
            alt="Album Art"
            class="w-full h-24 sm:h-48 object-cover rounded-t mb-2"
          />
          <h3 class="text-lg sm:text-xl font-bold mb-1">{{ songs[1].song }}</h3>
          <p class="text-gray-600 text-sm sm:text-base mb-1">
            <strong>Artist:</strong> {{ songs[1].artist }}
          </p>
          <p class="text-gray-600 text-sm sm:text-base mb-1">
            <strong>Album:</strong> {{ songs[1].album }}
          </p>
        </div>
      </div>

      <!-- Game Completion Message -->
      <div
        v-if="completed"
        class="text-center text-base sm:text-lg font-medium mt-6 sm:mt-8"
      >
        <h3 class="text-xl sm:text-2xl font-bold">
          Game Completed! Your favorite song is:
        </h3>
        <div class="bg-gray-100 p-4 rounded-lg my-4">
          <p class="text-lg sm:text-xl font-semibold">
            {{ favoriteSong.song }}
          </p>
          <p><strong>Artist:</strong> {{ favoriteSong.artist }}</p>
          <p><strong>Album:</strong> {{ favoriteSong.album }}</p>
        </div>

        <div
          v-if="previousFavorite.song"
          class="bg-yellow-100 p-4 rounded-lg shadow-md mt-4 sm:mt-6"
        >
          <h4 class="text-lg sm:text-xl font-bold text-yellow-700">
            Previously your favorite was:
          </h4>
          <p class="text-base sm:text-lg font-semibold">
            {{ previousFavorite.song }}
          </p>
          <p><strong>Artist:</strong> {{ previousFavorite.artist }}</p>
          <p><strong>Album:</strong> {{ previousFavorite.album }}</p>
        </div>

        <div
          v-if="historicalFavorite.song"
          class="bg-yellow-100 p-4 rounded-lg shadow-md mt-4 sm:mt-6"
        >
          <h4 class="text-lg sm:text-xl font-bold text-yellow-700">
            Your historical favorite was:
          </h4>
          <p class="text-base sm:text-lg font-semibold">
            {{ historicalFavorite.song }}
          </p>
          <p><strong>Artist:</strong> {{ historicalFavorite.artist }}</p>
          <p><strong>Album:</strong> {{ historicalFavorite.album }}</p>
        </div>

        <!-- Leaderboard -->
        <h4 class="text-xl sm:text-2xl font-bold mt-6 sm:mt-8">
          Top 5 Leaderboard:
        </h4>
        <ul class="list-disc list-inside mt-2 sm:mt-4">
          <li
            v-for="song in leaderboard"
            :key="song.id"
            class="text-base sm:text-lg"
          >
            <strong>{{ song.song }}</strong> by {{ song.artist }} ({{
              song.album
            }})
          </li>
        </ul>

        <!-- Restart Button -->
        <button
          class="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          @click="restartGame"
        >
          Restart Game
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      gameId: null,
      username: '',
      gameStarted: false,
      songs: [],
      favoriteSong: {},
      previousFavorite: {},
      historicalFavorite: {},
      leaderboard: [],
      error: null,
      loading: false,
      completed: false,
      currentRound: 1,
      totalRounds: 10,
    }
  },
  computed: {
    progressBarWidth() {
      return (this.currentRound / this.totalRounds) * 100
    },
  },
  methods: {
    async startGame() {
      try {
        this.loading = true
        if (!this.username) {
          this.error = 'Please enter your username.'
          this.loading = false
          return
        }
        const response = await axios.post('/api/game/start', {
          username: this.username,
        })
        this.gameId = response.data.gameId
        this.gameStarted = true
        await this.fetchRandomSongs()
      } catch (err) {
        this.error = `Error starting game: ${err.message || err}`
      } finally {
        this.loading = false
      }
    },
    async fetchRandomSongs() {
      try {
        this.loading = true
        const response = await axios.get(
          `/api/game/${this.gameId}/random-songs`,
        )
        if (response.data.songs.length < 2) {
          this.completed = true
          this.favoriteSong = response.data.favoriteSong || this.songs[0]
          this.previousFavorite = response.data.lastFavorite || {}
          this.historicalFavorite = response.data.historicalFavorite || {}
          await this.fetchLeaderboard()
        } else {
          this.songs = response.data.songs
        }
      } catch (err) {
        this.error = `Error fetching random songs: ${err.message || err}`
      } finally {
        this.loading = false
      }
    },
    async fetchLeaderboard() {
      try {
        const response = await axios.get('/api/game/leaderboard')
        this.leaderboard = response.data.topSongs
      } catch (err) {
        this.error = `Error fetching top 5 songs: ${err.message || err}`
      }
    },
    async selectSong(selectedSongId, unselectedSongId) {
      try {
        const response = await axios.post('/api/game/progress', {
          gameId: this.gameId,
          selectedSongId,
        })
        if (response.data.completed) {
          this.completed = true
          this.favoriteSong =
            response.data.favoriteSong ||
            this.songs.find((s) => s.id === selectedSongId)
          this.previousFavorite = response.data.secondLastFavorite || {}
          this.historicalFavorite = response.data.historicalFavorite || {}
          await this.fetchLeaderboard()
        } else {
          this.songs = [
            response.data.newSong,
            ...this.songs.filter((s) => s.id === selectedSongId),
          ]
          this.currentRound += 1
        }
      } catch (err) {
        this.error = `Error updating game progress: ${err.message || err}`
      }
    },
    restartGame() {
      window.location.reload()
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

.progress-bar {
  height: 4px;
  background-color: #8c0000;
  transition: width 0.3s ease;
}

.bg-yellow-100 {
  background-color: #fef3c7;
}

.text-yellow-700 {
  color: #b45309;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}

.bg-red-500 {
  background-color: #ef4444;
}

.bg-red-600:hover {
  background-color: #dc2626;
}
</style>
