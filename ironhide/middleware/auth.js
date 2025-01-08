export default function ({ redirect, route }) {
  const isAuthenticated = !!localStorage.getItem('token')

  // Routes that require authentication
  const requiresAuth = ['/editor', '/chatbot']

  if (requiresAuth.includes(route.path) && !isAuthenticated) {
    return redirect('/authn')
  }
}
