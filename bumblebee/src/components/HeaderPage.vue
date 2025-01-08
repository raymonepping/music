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
          <router-link
            to="/"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
          >
            Home
          </router-link>
          <router-link
            to="/albums"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
          >
            Albums
          </router-link>
          <router-link
            to="/music"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
          >
            Songs
          </router-link>
          <router-link
            to="/library"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
          >
            Library
          </router-link>
          <router-link
            to="/similarity"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
          >
            Similarity
          </router-link>
          <router-link
            to="/vectors"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
          >
            Vectors
          </router-link>
          <router-link
            to="/game"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
          >
            This?
          </router-link>
          <router-link
            to="/volt"
            class="transition duration-300 ease-in-out hover:font-bold hover:text-lg"
          >
            Volt!
          </router-link>
        </nav>

        <!-- Logo Image on the Right (Clickable) -->
        <router-link to="/authn">
          <img
            src="../assets/logo.png"
            alt="Logo"
            class="h-8 w-auto ml-4 cursor-pointer"
          />
        </router-link>
      </div>
    </div>

    <!-- Sidebar (Visible Only for Admins) -->
    <aside
      v-if="isAdmin"
      :class="{ collapsed: isCollapsed }"
      class="fixed top-20 right-0 bg-darkgrey text-black py-4 shadow-lg"
    >
      <!-- Toggle Sidebar Button -->
      <button
        @click="toggleSidebar"
        class="sidebar-toggle-btn px-4 py-2 bg-gray-300 text-black hover:bg-gray-400"
      >
        <i
          :class="isCollapsed ? 'fas fa-chevron-left' : 'fas fa-chevron-right'"
        ></i>
      </button>

      <!-- Admin Links -->
      <div v-if="!isCollapsed" class="admin-links">
        <h2 class="text-lg font-bold px-4">Admin Links</h2>
        <ul class="space-y-2 px-4">
          <li>
            <router-link
              to="/editor"
              class="flex items-center space-x-2 transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >
              <i class="fas fa-edit"></i>
              <span>Editor</span>
            </router-link>
          </li>
          <li>
            <router-link
              to="/analytics"
              class="flex items-center space-x-2 transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >
              <i class="fas fa-chart-bar"></i>
              <span>Analytics</span>
            </router-link>
          </li>
          <li>
            <router-link
              to="/logs"
              class="flex items-center space-x-2 transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >
              <i class="fas fa-file-alt"></i>
              <span>Logs</span>
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Only Icons When Collapsed -->
      <div v-else class="icon-only">
        <ul class="space-y-2 flex flex-col items-center">
          <li>
            <router-link
              to="/editor"
              class="flex items-center transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >
              <i class="fas fa-edit"></i>
            </router-link>
          </li>
          <li>
            <router-link
              to="/analytics"
              class="flex items-center transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >
              <i class="fas fa-chart-bar"></i>
            </router-link>
          </li>
          <li>
            <router-link
              to="/logs"
              class="flex items-center transition duration-300 ease-in-out hover:font-bold hover:text-lg"
            >
              <i class="fas fa-file-alt"></i>
            </router-link>
          </li>
        </ul>
      </div>
    </aside>
  </header>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "HeaderPage",
  data() {
    return {
      isCollapsed: false, // Sidebar starts expanded
    };
  },
  computed: {
    ...mapGetters(["isAuthenticated", "currentUser"]),
    isAdmin() {
      return this.currentUser?.roles?.includes("admin") || false;
    },
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
    },
  },
};
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

/* Admin Links section */
.admin-links {
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
