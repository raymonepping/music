<template>
  <div class="flex flex-col min-h-screen">

    <!-- Main Container -->
    <div class="container mx-auto mt-24 p-6 text-center flex-grow">
      <h1 class="text-3xl font-bold text-black text-center mb-8">
        Welcome to Couchbase NoSQL
      </h1>

      <!-- Content Section -->
      <div
        class="flex flex-col items-center justify-start bg-gray-100 text-gray-900 rounded shadow p-6 max-w-lg mx-auto"
      >
        <!-- NuxtJS Logo Image -->
        <img
          src="~/assets/NuxtJS_Logo.png"
          alt="NuxtJS Logo"
          class="w-96 h-128 object-contain mb-4"
        />
      </div>
    </div>

  </div>
</template>

<script>
// Import the AppHeader and AppFooter components
// import AppHeader from '@/components/AppHeader.vue'
// import AppFooter from '@/components/AppFooter.vue'

export default {
  name: 'HomePage',
  components: {
    // AppHeader,
    // AppFooter,
  },
}
</script>

<style scoped>
/* Custom Tailwind classes for the red header */
.bg-red-600 {
  background-color: rgb(235, 0, 0);
}

/* Optional: Adjust the container margin-top to match the height of the header */
.mt-24 {
  margin-top: 96px; /* Adjust this value if your header's height changes */
}

/* Ensures the footer stays at the bottom of the screen */
.flex-grow {
  flex-grow: 1;
}
</style>
