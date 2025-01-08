import axios from 'axios'

// Helper function to manually decode the JWT payload
function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

export const state = () => ({
  user: null,
  isAuthenticated: false,
  token: process.browser ? localStorage.getItem('token') : null,
})

export const mutations = {
  setUser(state, user) {
    state.user = user
    state.isAuthenticated = true
  },
  setToken(state, token) {
    state.token = token
    if (process.browser) localStorage.setItem('token', token)
    axios.defaults.headers.common.Authorization = `Bearer ${token}`
  },
  clearUser(state) {
    state.user = null
    state.isAuthenticated = false
    state.token = null
    if (process.browser) {
      localStorage.removeItem('token')
      localStorage.removeItem('currentUser')
    }
    delete axios.defaults.headers.common.Authorization
  },
}

export const actions = {
  async login({ commit }, { username, password }) {
    try {
      const response = await axios.post('/api/users/login', {
        username,
        password,
      })
      const { token } = response.data

      commit('setToken', token)
      const decodedUser = decodeToken(token)
      commit('setUser', decodedUser)
      if (process.browser)
        localStorage.setItem('currentUser', JSON.stringify(decodedUser))

      return true
    } catch (error) {
      console.error('Error logging in:', error)
      return false
    }
  },
  logout({ commit }) {
    commit('clearUser')
  },
  initializeUser({ commit }) {
    const token = process.browser ? localStorage.getItem('token') : null
    if (token) {
      const decodedUser = decodeToken(token)
      commit('setUser', decodedUser)
      commit('setToken', token)
    }
  },
}

export const getters = {
  isAuthenticated: (state) => state.isAuthenticated,
  currentUser: (state) => state.user,
}
