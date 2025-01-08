<template>
  <header
    class="bg-gradient-to-tr from-primary via-brightred via-darkred via-brightpurple via-darkpurple to-secondary text-white py-4 shadow-md fixed w-full top-0 z-50"
  >
    <div class="container mx-auto flex justify-between items-center h-full">
      <!-- Title on the Left -->
      <div class="flex flex-grow items-center justify-start h-full">
        <h1 class="text-2xl font-bold flex items-center justify-center h-full">
          Couchbase - AI - Assisted NoSQL
        </h1>
      </div>

      <!-- Navigation Links on the Right -->
      <div class="flex space-x-6 items-center">
        <nav class="flex space-x-6">
          <nuxt-link
            to="/"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >Home</nuxt-link
          >
          <nuxt-link
            to="/albums"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >Albums</nuxt-link
          >
          <nuxt-link
            to="/music"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >Songs</nuxt-link
          >
          <nuxt-link
            to="/library"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >Library</nuxt-link
          >
          <nuxt-link
            to="/similarity"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >Similarity</nuxt-link
          >
          <nuxt-link
            to="/vectors"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >Vectors</nuxt-link
          >
          <nuxt-link
            to="/game"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >This?</nuxt-link
          >
          <nuxt-link
            to="/chatbot"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >Volt!</nuxt-link
          >
        </nav>

        <!-- Logo Image -->
        <nuxt-link to="/authn">
          <img
            src="../assets/logo.png"
            alt="Logo"
            class="h-8 w-auto ml-4 cursor-pointer"
          />
        </nuxt-link>
      </div>
    </div>

    <!-- Sidebar for Admin Users -->
    <aside
      v-if="isAdmin"
      :class="{ collapsed: isCollapsed }"
      class="fixed top-20 right-0 bg-darkgrey text-black py-4 shadow-lg"
    >
      <!-- Toggle Sidebar Button -->
      <button
        class="sidebar-toggle-btn px-4 py-2 bg-gray-300 text-black hover:bg-gray-400"
        @click="toggleSidebar"
      >
        <i
          :class="isCollapsed ? 'fas fa-chevron-left' : 'fas fa-chevron-right'"
        ></i>
      </button>

      <!-- Sidebar Content -->
      <div v-show="!isCollapsed" class="admin-links">
        <h2 class="text-lg font-bold px-4">Admin Links</h2>
        <ul class="space-y-2 px-4">
          <li>
            <nuxt-link
              to="/editor"
              class="flex items-center space-x-2 transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >
              <i class="fas fa-edit"></i>
              <span>Editor</span>
            </nuxt-link>
          </li>
          <li>
            <nuxt-link
              to="/analytics"
              class="flex items-center space-x-2 transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >
              <i class="fas fa-chart-bar"></i>
              <span>Analytics</span>
            </nuxt-link>
          </li>
          <li>
            <nuxt-link
              to="/logs"
              class="flex items-center space-x-2 transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >
              <i class="fas fa-file-alt"></i>
              <span>Logs</span>
            </nuxt-link>
          </li>
        </ul>
      </div>

      <div v-show="isCollapsed" class="icon-only">
        <ul class="space-y-2 flex flex-col items-center">
          <li>
            <nuxt-link
              to="/editor"
              class="flex items-center transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >
              <i class="fas fa-edit"></i>
            </nuxt-link>
          </li>
          <li>
            <nuxt-link
              to="/analytics"
              class="flex items-center transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >
              <i class="fas fa-chart-bar"></i>
            </nuxt-link>
          </li>
          <li>
            <nuxt-link
              to="/logs"
              class="flex items-center transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >
              <i class="fas fa-file-alt"></i>
            </nuxt-link>
          </li>
        </ul>
      </div>
    </aside>
  </header>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'AppHeader',
  data() {
    return {
      isCollapsed: false, // Sidebar starts expanded
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'currentUser']),
    isAdmin() {
      return this.currentUser?.roles?.includes('admin') || false
    },
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed
    },
  },
}
</script>

<style scoped>
/* Sidebar styles */
aside {
  width: 250px;
  transition: width 0.3s ease-in-out;
}
aside.collapsed {
  width: 50px;
  overflow: hidden;
}

/* Sidebar toggle button */
.sidebar-toggle-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
}

.sidebar-toggle-btn:hover {
  background-color: rgba(128, 128, 128, 0.3);
}

/* Admin Links */
.admin-links {
  opacity: 1;
  transition: opacity 0.3s ease-in-out;
}

.icon-only ul {
  padding: 0;
}

.icon-only ul li {
  list-style: none;
}

.icon-only ul li i {
  font-size: 1.5rem;
  transition: transform 0.3s ease-in-out;
}

.icon-only ul li:hover i {
  transform: scale(1.2);
}
</style>
