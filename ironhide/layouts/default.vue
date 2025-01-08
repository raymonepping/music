<!-- layouts/default.vue -->
<template>
  <div>
    <AppHeader />
    <Nuxt />
    <AppFooter />
  </div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'

export default {
  components: {
    AppHeader,
    AppFooter,
  },
  mounted() {
    this.$store.dispatch('initializeUser')
  },
}
</script>
