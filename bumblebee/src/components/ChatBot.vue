<template>
  <div>
    <!-- Header with Navigation Links -->
    <HeaderPage />

    <!-- Main Container -->
    <div class="container mx-auto mt-12 p-6">
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
            @keydown.enter="sendMessage"
            class="flex-1 p-3 border rounded shadow-sm"
          />
          <button
            @click="sendMessage"
            class="ml-2 bg-blue-500 text-white px-6 py-3 rounded shadow hover:bg-blue-600"
          >
            Send
          </button>
        </div>
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
  name: "ChatBot",
  components: {
    HeaderPage,
    Footer,
  },
  data() {
    return {
      message: "",
      chats: [],
      username: "User", // Default if localStorage retrieval fails
    };
  },
  mounted() {
    // Fetch username from localStorage on mount
    try {
      const userDetails = JSON.parse(localStorage.getItem("userDetails"));
      this.username = userDetails?.username || "User";
      console.log("Username from localStorage:", this.username); // Debugging output
    } catch (e) {
      console.warn("Could not retrieve user details from localStorage:", e);
    }

    this.scrollToBottom(); // Automatically scroll to bottom on initial load
  },
  updated() {
    this.scrollToBottom(); // Scroll to bottom on component update (new messages)
  },
  methods: {
    async sendMessage() {
      if (this.message.trim()) {
        try {
          // Send message to backend API and get the bot's response
          const response = await axios.post("/api/chatbot/store", {
            message: this.message,
            userId: this.username, // Use the dynamic username from mounted()
          });

          // Append user's message to chat
          this.chats.push({
            userId: this.username,
            message: this.message,
            timestamp: new Date().toISOString(),
          });

          // Append bot's response to chat
          if (response.data.botResponse) {
            const chatResponse = {
              userId: "Volt",
              response: response.data.botResponse,
              timestamp: new Date().toISOString(),
            };
            if (response.data.albumart) {
              chatResponse.albumart = response.data.albumart;
            }
            this.chats.push(chatResponse);
          }

          // Clear input field
          this.message = "";
        } catch (err) {
          console.error("Error sending message:", err);
        }
      }
    },
    scrollToBottom() {
      const container = this.$refs.messageContainer;
      container.scrollTop = container.scrollHeight;
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
};
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

/* Increase album art size */
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

/* Animations */
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

/* Increased chat message container height */
.messages {
  max-height: 700px;
}
</style>
