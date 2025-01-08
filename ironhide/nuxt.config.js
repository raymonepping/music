export default {
  server: {
    port: 8090, // Nuxt.js will run on port 8090
    host: '0.0.0.0', // Listen on all network interfaces
  },

  router: {
    middleware: ['auth'], // Apply the auth middleware globally
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@/assets/css/tailwind.css', // Include Tailwind CSS globally
    '@fortawesome/fontawesome-free/css/all.css', // Include FontAwesome globally
  ],

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Ironhide',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/eslint-module', // ESLint for linting and code quality
    '@nuxtjs/tailwindcss', // Tailwind CSS integration
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/proxy', // Adding the proxy module to handle API calls
  ],

  // Proxy setup to forward API requests to the springer container
  proxy: {
    '/api/': 'http://springer:3000', // Proxy /api requests to the backend springer service
  },

  // Disable server-side rendering (SSR)
  ssr: false,

  // Environment variables for baseUrl
  env: {
    baseUrl: process.env.BASE_URL || 'http://springer:3000', // Set the default base URL for Axios and API calls
  },

  // Axios configuration (optional, if using Axios globally)
  axios: {
    baseURL: process.env.BASE_URL || 'http://springer:3000', // Use the base URL in Axios for API requests
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},

  // Tailwind CSS configuration (optional)
  tailwindcss: {
    // Tailwind CSS configuration options
  },
}
