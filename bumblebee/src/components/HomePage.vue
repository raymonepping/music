<template>
  <div class="flex flex-col min-h-screen">
    <!-- Ensuring full height layout for footer placement -->

    <!-- Header Component -->
    <HeaderPage />

    <!-- Main Container -->
    <div class="container mx-auto mt-24 p-6 text-center flex-grow">
      <h2 class="text-3xl font-bold text-black text-center mb-8">
        Welcome to Couchbase NoSQL & Directus CMS
      </h2>

      <!-- Content Section -->
      <div
        class="flex flex-col items-center justify-start bg-gray-100 text-gray-900 rounded shadow p-6 max-w-lg mx-auto"
      >
        <!-- VueJS Logo Image -->
        <img
          src="../assets/VueJS_Logo.png"
          alt="VueJS Logo"
          class="w-96 h-128 object-contain mb-4"
        />
      </div>
    </div>
    <!-- Footer Component -->
    <Footer />
    <!-- Keeping the footer at the bottom -->
  </div>
</template>

<script>
// Import the HeaderPage and Footer components using relative paths
import HeaderPage from "./HeaderPage.vue";
import Footer from "./Footer.vue";

export default {
  name: "HomePage",
  components: {
    HeaderPage, // Registering the HeaderPage component
    Footer, // Registering the Footer component
  },
};
</script>

<style scoped>
/* Custom Tailwind classes for the red header */
.bg-red-600 {
  background-color: rgb(235, 0, 0);
}
</style>
