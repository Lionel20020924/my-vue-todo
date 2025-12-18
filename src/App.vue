<script setup>
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <div class="brand">My Todo</div>
      <nav class="nav">
        <RouterLink to="/" class="link" active-class="active">Todo</RouterLink>
        <RouterLink to="/about" class="link" active-class="active">About</RouterLink>
      </nav>
    </header>

    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.shell {
  font-family: Arial, sans-serif;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #eee;
}
.brand {
  font-weight: 800;
}
.nav {
  display: flex;
  gap: 10px;
}
.link {
  text-decoration: none;
  color: inherit;
  opacity: 0.8;
}
.link.active {
  opacity: 1;
  font-weight: 700;
  border-bottom: 2px solid #333;
}
.main {
  padding: 20px 12px;
}
</style>
