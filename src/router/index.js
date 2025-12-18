import { createRouter, createWebHistory } from "vue-router";
import TodoPage from "../pages/TodoPage.vue";
import AboutPage from "../pages/AboutPage.vue";

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "todo", component: TodoPage },
    { path: "/about", name: "about", component: AboutPage },
  ],
});
