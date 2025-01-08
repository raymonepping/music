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
          <NuxtLink
            to="/"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >Home</NuxtLink
          >
          <NuxtLink
            to="/albums"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >Albums</NuxtLink
          >
          <NuxtLink
            to="/music"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >Songs</NuxtLink
          >
          <NuxtLink
            to="/library"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >Library</NuxtLink
          >
          <NuxtLink
            to="/similarity"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >Similarity</NuxtLink
          >
          <NuxtLink
            to="/vectors"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >Vectors</NuxtLink
          >
          <NuxtLink
            to="/game"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >This?</NuxtLink
          >
          <NuxtLink
            to="/chatbot"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >Volt!</NuxtLink
          >
        </nav>

        <!-- Logo Image -->
        <NuxtLink to="/authn">
          <img
            src="../assets/logo.png"
            alt="Logo"
            class="h-8 w-auto ml-4 cursor-pointer"
          />
        </NuxtLink>
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
            <NuxtLink
              to="/editor"
              class="flex items-center space-x-2 transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >
              <i class="fas fa-edit"></i>
              <span>Editor</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/analytics"
              class="flex items-center space-x-2 transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >
              <i class="fas fa-chart-bar"></i>
              <span>Analytics</span>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/logs"
              class="flex items-center space-x-2 transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >
              <i class="fas fa-file-alt"></i>
              <span>Logs</span>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div v-show="isCollapsed" class="icon-only">
        <ul class="space-y-2 flex flex-col items-center">
          <li>
            <NuxtLink
              to="/editor"
              class="flex items-center transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >
              <i class="fas fa-edit"></i>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/analytics"
              class="flex items-center transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >
              <i class="fas fa-chart-bar"></i>
            </NuxtLink>
          </li>
          <li>
            <NuxtLink
              to="/logs"
              class="flex items-center transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >
              <i class="fas fa-file-alt"></i>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </aside>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { storeToRefs } from 'pinia'

// State for sidebar collapse
const isCollapsed = ref(false)

// Access the authentication store
const authStore = useAuthStore()
const { isAuthenticated, currentUser } = storeToRefs(authStore)

// Determine if the user is an admin
const isAdmin = computed(() => {
  return currentUser.value?.roles?.includes('admin') || false
})

// Method to toggle sidebar
function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
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
