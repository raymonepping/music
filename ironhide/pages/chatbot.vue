<template>
  <div class="flex flex-col min-h-screen">
    <!-- AppHeader Component -->
    

    <!-- Main Container -->
    <div class="container mx-auto mt-24 p-6 flex-grow">
      <h2 class="text-2xl font-bold text-center mb-8">
        I am Volt - Your AI-based Music Controller
      </h2>

      <!-- Chat Container -->
      <div
        class="chat-container bg-white shadow-lg rounded-lg p-6 max-w-6xl mx-auto"
      >
        <!-- Messages -->
        <div
          ref="messageContainer"
          class="messages max-h-[700px] overflow-y-auto mb-4"
        >
          <div v-for="(chat, index) in chats" :key="index" class="message">
            <div v-if="chat.userId === 'Volt'" class="text-left">
              <p class="bg-gray-100 p-4 rounded mb-2 fade-in">
                <strong class="text-green-600">{{ chat.userId }}:</strong>
                {{ chat.response }}
                <span v-if="chat.albumart" class="block mt-2">
                  <img :src="chat.albumart" alt="Album Art" class="album-art" />
                </span>
                <span class="block text-xs text-gray-400 mt-1">{{
                  formatTimestamp(chat.timestamp)
                }}</span>
              </p>
            </div>
            <div v-else class="text-right">
              <p class="bg-blue-100 p-4 rounded mb-2 fade-in">
                <strong class="text-blue-600">{{ chat.userId }}:</strong>
                {{ chat.message }}
                <span class="block text-xs text-gray-400 mt-1">{{
                  formatTimestamp(chat.timestamp)
                }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Input Container -->
        <div class="input-container flex">
          <input
            v-model="message"
            type="text"
            placeholder="Type a message"
            class="flex-1 p-3 border rounded shadow-sm"
            @keydown.enter="sendMessage"
          />
          <button
            class="ml-2 bg-blue-500 text-white px-6 py-3 rounded shadow hover:bg-blue-600"
            @click="sendMessage"
          >
            Send
          </button>
        </div>
      </div>
    </div>

    <!-- AppFooter Component -->
    
  </div>
</template>

<script>
import axios from 'axios'
// import AppHeader from '@/components/AppHeader.vue'
// import AppFooter from '@/components/AppFooter.vue'

export default {
  meta: { requiresAuth: true },
  name: 'ChatBot',
  components: {
//  AppHeader,
//  AppFooter,
  },
  data() {
    let username = 'User'
    try {
      const userDetails = JSON.parse(localStorage.getItem('userDetails'))
      username = userDetails?.username || 'User' // Access 'username' from parsed object
    } catch (e) {
      console.error('Error retrieving userDetails from localStorage:', e)
    }

    return {
      message: '',
      chats: [],
      username,
    }
  },
  mounted() {
    this.scrollToBottom()
  },
  updated() {
    this.scrollToBottom()
  },
  methods: {
    async sendMessage() {
      if (this.message.trim()) {
        try {
          const response = await axios.post('/api/chatbot/store', {
            message: this.message,
            userId: this.username, // Use this.username directly
            // userId: 'RaymonE',
          })

          this.chats.push({
            // userId: 'RaymonE',
            userId: this.username,
            message: this.message,
            timestamp: new Date().toISOString(),
          })

          if (response.data.botResponse) {
            const chatResponse = {
              userId: 'Volt',
              response: response.data.botResponse,
              timestamp: new Date().toISOString(),
            }
            if (response.data.albumart) {
              chatResponse.albumart = response.data.albumart
            }
            this.chats.push(chatResponse)
          }

          this.message = ''
        } catch (err) {
          console.error('Error sending message:', err)
        }
      }
    },
    scrollToBottom() {
      const container = this.$refs.messageContainer
      container.scrollTop = container.scrollHeight
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
  },
}
</script>

<style scoped>
/* Chat Container Styling */
.chat-container {
  border: 1px solid #ddd;
  padding: 16px;
  border-radius: 8px;
  max-width: 1100px;
}

/* Message Styling */
.message {
  margin-bottom: 12px;
}

.text-right .message {
  background-color: #e0f7fa;
  text-align: right;
}

.text-left .message {
  background-color: #f1f1f1;
  text-align: left;
}

/* Album Art Styling */
.album-art {
  width: 5cm;
  height: 5cm;
  object-fit: cover;
  border-radius: 8px;
}

/* Input and Button Styling */
.input-container {
  display: flex;
}

input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

button {
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

/* Fade-in Animation */
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Flexbox Layout to Grow Content Area */
.flex-grow {
  flex-grow: 1;
}
</style>
