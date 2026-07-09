<template>
  <div>
    <nav class="nav">
      <div class="nav-left">
        <button :class="['nav-btn', { active: page === 'users' }]" @click="page = 'users'">用户管理</button>
        <button :class="['nav-btn', { active: page === 'auth' }]" @click="page = 'auth'">登录 / 注册</button>
      </div>
      <div class="nav-right">
        <span v-if="user" class="user-name">{{ user.name }}</span>
        <button v-if="user" class="nav-btn logout" @click="handleLogout">退出</button>
      </div>
    </nav>
    <UsersView v-if="page === 'users'" />
    <AuthView v-else @auth-success="handleAuthSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import UsersView from "./views/UsersView.vue"
import AuthView from "./views/AuthView.vue"

const page = ref("users")
const user = ref<any>(null)

onMounted(() => {
  const stored = localStorage.getItem("user")
  if (stored) user.value = JSON.parse(stored)
})

function handleAuthSuccess() {
  const stored = localStorage.getItem("user")
  if (stored) {
    user.value = JSON.parse(stored)
    page.value = "users"
  }
}

function handleLogout() {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  user.value = null
  page.value = "auth"
}
</script>

<style>
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
.nav {
  display: flex; justify-content: space-between; align-items: center;
  background: #fff; border-bottom: 1px solid #eee; padding: 0 20px;
}
.nav-left { display: flex; }
.nav-right { display: flex; align-items: center; gap: 12px; }
.nav-btn {
  padding: 14px 24px; border: none; background: none;
  font-size: 14px; cursor: pointer; color: #666;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
}
.nav-btn.active { color: #409eff; border-bottom-color: #409eff; }
.nav-btn:hover { color: #409eff; }
.nav-btn.logout { color: #f56c6c; border-bottom: none; }
.nav-btn.logout:hover { color: #d9544f; }
.user-name { font-size: 14px; color: #333; }
</style>
