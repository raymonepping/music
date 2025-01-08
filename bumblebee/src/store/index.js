import { createStore } from "vuex";
import axios from "axios";

// Helper function to manually decode the JWT payload
function decodeToken(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

export default createStore({
  state: {
    user: null,
    isAuthenticated: false,
    token: localStorage.getItem("token") || null,
  },
  mutations: {
    setUser(state, user) {
      console.log("Mutation setUser called with:", user);
      state.user = user;
      state.isAuthenticated = true;
    },
    setToken(state, token) {
      console.log("Mutation setToken called with:", token);
      state.token = token;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    },
    clearUser(state) {
      console.log("Mutation clearUser called");
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      delete axios.defaults.headers.common["Authorization"];
    },
  },
  actions: {
    async login({ commit }, { username, password }) {
      try {
        console.log("Action login called with:", { username, password });
        const response = await axios.post("/api/users/login", {
          username,
          password,
        });
        const { token } = response.data;

        console.log("Login successful, setting token:", token);

        commit("setToken", token);

        const decodedUser = decodeToken(token);
        commit("setUser", decodedUser);
        localStorage.setItem("currentUser", JSON.stringify(decodedUser));

        return true;
      } catch (error) {
        console.error("Error logging in:", error);
        return false;
      }
    },
    logout({ commit }) {
      console.log("Action logout called");
      commit("clearUser");
    },
    initializeUser({ commit }) {
      const token = localStorage.getItem("token");
      if (token) {
        console.log("Token found in localStorage, initializing user");
        const decodedUser = decodeToken(token);
        commit("setUser", decodedUser);
        commit("setToken", token);
      } else {
        console.log("No token found in localStorage, skipping initialization");
      }
    },
  },
  getters: {
    isAuthenticated: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
  },
});
