<template>
  <div>
    <nav class="nav">
      <div class="nav-left">
        <router-link to="/users" class="nav-btn" active-class="active">用户管理</router-link>
        <router-link to="/posts" class="nav-btn" active-class="active">文章管理</router-link>
        <router-link to="/products" class="nav-btn" active-class="active">商品管理</router-link>
        <router-link to="/orders" class="nav-btn" active-class="active">订单管理</router-link>
        <router-link to="/auth" class="nav-btn" active-class="active">登录 / 注册</router-link>
      </div>
      <div class="nav-right">
        <span v-if="user" class="user-name">{{ user.name }}</span>
        <button v-if="user" class="nav-btn logout" @click="handleLogout">退出</button>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
const user = ref<any>(null)

function checkUser() {
  const stored = localStorage.getItem("user")
  user.value = stored ? JSON.parse(stored) : null
}
onMounted(checkUser)
router.afterEach(() => checkUser())

function handleLogout() {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  user.value = null
  router.push("/auth")
}
</script>

<style>
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
.nav { display:flex; justify-content:space-between; align-items:center; background:#fff; border-bottom:1px solid #eee; padding:0 20px; }
.nav-left { display:flex; }
.nav-right { display:flex; align-items:center; gap:12px; }
.nav-btn { padding:14px 24px; border:none; background:none; font-size:14px; cursor:pointer; color:#666; border-bottom:2px solid transparent; margin-bottom:-1px; text-decoration:none; display:inline-block; }
.nav-btn.active { color:#409eff; border-bottom-color:#409eff; }
.nav-btn:hover { color:#409eff; }
.nav-btn.logout { color:#f56c6c; border-bottom:none; }
.nav-btn.logout:hover { color:#d9544f; }
.user-name { font-size:14px; color:#333; }
</style>
