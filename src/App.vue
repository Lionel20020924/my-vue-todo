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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 100;
}

.brand {
  font-weight: 800;
  font-size: 1.5rem;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

.nav {
  display: flex;
  gap: 8px;
}

.link {
  text-decoration: none;
  color: #666;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 15px;
  transition: all 0.2s ease;
  background: transparent;
}

.link:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #333;
}

.link.active {
  color: white;
  background: #333;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.main {
  padding: 40px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

@media (max-width: 720px) {
  .topbar {
    padding: 16px 20px;
  }

  .brand {
    font-size: 1.25rem;
  }

  .nav {
    gap: 4px;
  }

  .link {
    padding: 6px 16px;
    font-size: 14px;
  }

  .main {
    padding: 24px 12px;
  }
}
</style>
