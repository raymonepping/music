<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header Component -->
    <HeaderPage />

    <div
      class="authn-container mx-auto max-w-2xl py-6 px-8 bg-white shadow-lg rounded-lg mt-4"
    >
      <!-- Welcome Message and Logout Button After Successful Authentication -->
      <div v-if="isAuthenticated && currentUser" class="welcome-message">
        <h2 class="text-2xl font-bold text-center text-darkred mb-4">
          Welcome, {{ currentUser.first_name }} {{ currentUser.last_name }}!
        </h2>
        <p class="text-center text-gray-700">
          You are successfully authenticated.
        </p>
        <p class="text-center text-gray-500 mt-2">{{ message }}</p>

        <!-- Logout Button -->
        <button @click="handleLogout" class="logout-btn mt-4">Logout</button>
      </div>

      <!-- Login Form for Unauthenticated Users -->
      <div v-else>
        <div class="box-container mb-8">
          <h2 class="section-title">User Authentication</h2>
          <form @submit.prevent="handleLogin">
            <div class="mb-4">
              <label for="loginUsername" class="label">Username</label>
              <input
                type="text"
                id="loginUsername"
                v-model="loginUsername"
                class="input-field"
                required
              />
            </div>
            <div class="mb-4">
              <label for="loginPassword" class="label">Password</label>
              <input
                type="password"
                id="loginPassword"
                v-model="loginPassword"
                class="input-field"
                required
              />
            </div>
            <button type="submit" class="submit-btn">Login</button>
          </form>
        </div>

        <!-- Registration Form Section -->
        <div class="box-container">
          <h2 class="section-title">User Registration</h2>
          <form @submit.prevent="handleSubmit">
            <div class="mb-4">
              <label for="firstName" class="label">First Name</label>
              <input
                type="text"
                id="firstName"
                v-model="firstName"
                class="input-field"
                required
              />
            </div>
            <div class="mb-4">
              <label for="lastName" class="label">Last Name</label>
              <input
                type="text"
                id="lastName"
                v-model="lastName"
                class="input-field"
                required
              />
            </div>
            <div class="mb-4">
              <label for="password" class="label">Password</label>
              <input
                type="password"
                id="password"
                v-model="password"
                class="input-field"
                required
              />
            </div>
            <div class="mb-4">
              <label for="username" class="label">Username</label>
              <input
                type="text"
                id="username"
                v-model="userName"
                class="input-field bg-gray-100 text-gray-500"
                readonly
              />
            </div>
            <button type="submit" class="submit-btn">Register</button>
          </form>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import HeaderPage from "./HeaderPage.vue";
import Footer from "./Footer.vue";
import axios from "axios";

export default {
  name: "AuthN",
  components: { HeaderPage, Footer },
  data() {
    return {
      loginUsername: "",
      loginPassword: "",
      firstName: "",
      lastName: "",
      password: "",
      userName: "",
      message: "",
    };
  },
  computed: {
    ...mapGetters(["isAuthenticated", "currentUser"]),
  },
  watch: {
    isAuthenticated(val) {
      if (val && this.currentUser) {
        this.message = `Welcome, ${this.currentUser.first_name} ${this.currentUser.last_name}! Redirecting to home...`;
        setTimeout(() => this.$router.push("/"), 2000);
      }
    },
  },
  methods: {
    ...mapActions(["login", "logout"]),

    async handleLogin() {
      const success = await this.login({
        username: this.loginUsername.toLowerCase(),
        password: this.loginPassword,
      });

      if (success && this.currentUser) {
        this.message = `Welcome, ${this.currentUser.first_name} ${this.currentUser.last_name}!`;
      } else {
        this.message = "Login failed. Please check your credentials.";
      }

      this.loginUsername = "";
      this.loginPassword = "";
    },

    async handleSubmit() {
      try {
        const response = await axios.post("/api/users/create-user", {
          first_name: this.firstName,
          last_name: this.lastName,
          user_password: this.password,
        });

        this.userName = response.data.username;
        this.message = "User registered successfully!";

        setTimeout(() => {
          this.firstName = "";
          this.lastName = "";
          this.password = "";
          this.userName = "";
          this.message = "";
        }, 3000);
      } catch (error) {
        this.message = "Error creating user. Please try again.";
      }
    },

    handleLogout() {
      this.logout();
      this.message = "You have been logged out successfully.";
    },
  },
};
</script>

<style scoped>
.authn-container {
  background-color: rgb(250, 240, 220);
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.box-container {
  background-color: rgb(255, 255, 255);
  padding: 20px;
  border: 1px solid rgb(236, 16, 24);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.section-title {
  color: rgb(200, 0, 0);
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center;
}

.input-field {
  width: 100%;
  padding: 8px;
  border: 1px solid rgb(169, 169, 169);
  border-radius: 4px;
  outline: none;
  transition: border-color 0.3s;
}

.input-field:focus {
  border-color: rgb(236, 16, 24);
}

.label {
  color: rgb(64, 64, 64);
  font-weight: 600;
  margin-bottom: 4px;
  display: block;
  font-size: 0.9rem;
}

.submit-btn {
  width: 100%;
  padding: 10px;
  background-color: rgb(200, 0, 0);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: rgb(236, 16, 24);
}

.logout-btn {
  width: 100%;
  padding: 10px;
  background-color: #333;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #555;
}

.welcome-message {
  text-align: center;
  padding: 20px;
  background-color: #e6ffe6;
  border: 1px solid #00c853;
  border-radius: 8px;
}
</style>
