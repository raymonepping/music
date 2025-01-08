import { createRouter, createWebHistory } from "vue-router";
import AlbumEditor from "../components/AlbumEditor.vue";
import AnalyticsPage from "../components/AnalyticsPage.vue";
import AuthN from "../components/AuthN.vue";
import ChatBot from "../components/ChatBot.vue";
import GamePage from "../components/GamePage.vue";
import HomePage from "../components/HomePage.vue";
import LibraryPage from "../components/LibraryPage.vue";
import LogsPage from "../components/LogsPage.vue";
import MusicPage from "../components/MusicPage.vue";
import SimilarityPage from "../components/SimilarityPage.vue";
import SongEditor from "../components/SongEditor.vue";
import VectorPage from "../components/VectorPage.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
  },
  {
    path: "/library",
    name: "Library",
    component: LibraryPage,
    meta: { requiresAuth: false },
  },
  {
    path: "/music",
    name: "Music",
    component: MusicPage,
    meta: { requiresAuth: false },
  },
  {
    path: "/similarity",
    name: "Similarity",
    component: SimilarityPage,
    meta: { requiresAuth: false },
  },
  {
    path: "/vectors",
    name: "Vectors",
    component: VectorPage,
    meta: { requiresAuth: false },
  },
  {
    path: "/game",
    name: "Game",
    component: GamePage,
    meta: { requiresAuth: true },
  },
  {
    path: "/albums",
    name: "Albums",
    component: AlbumEditor,
    meta: { requiresAuth: false },
  },
  {
    path: "/editor",
    name: "Editor",
    component: SongEditor,
    meta: { requiresAuth: true },
  },
  {
    path: "/volt",
    name: "Volt",
    component: ChatBot,
    meta: { requiresAuth: true },
  },
  {
    path: "/analytics",
    name: "Analytics",
    component: AnalyticsPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/logs",
    name: "Logs",
    component: LogsPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/authn",
    name: "AuthN",
    component: AuthN,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global navigation guard to check for authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("token");

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: "AuthN" });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
