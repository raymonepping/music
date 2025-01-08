import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store"; // Import the Vuex store
import "./assets/tailwind.css";

// Import FontAwesome CSS
import "@fortawesome/fontawesome-free/css/all.css";

createApp(App)
  .use(router)
  .use(store) // Register the Vuex store
  .mount("#app");

store.dispatch("initializeUser"); // Initialize user state from localStorage if available
