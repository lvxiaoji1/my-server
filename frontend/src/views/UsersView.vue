<template>
  <div class="container">
    <h1 class="page-title">用户管理</h1>

    <div class="card">
      <h3>{{ editingId ? "编辑用户" : "添加用户" }}</h3>
      <div class="form-row">
        <input v-model="form.name" placeholder="请输入姓名" class="input" />
        <input v-model="form.email" placeholder="请输入邮箱" class="input" />
        <button class="btn btn-primary" @click="handleAdd">{{ editingId ? "保存" : "添加" }}</button>
        <button v-if="editingId" class="btn btn-cancel" @click="cancelEdit">取消</button>
      </div>
    </div>

    <div class="card">
      <h3>搜索用户</h3>
      <div class="search-row">
        <input v-model="searchText" placeholder="搜索姓名或邮箱..." class="input" @keyup.enter="handleSearch" />
        <button class="btn btn-primary" @click="handleSearch">搜索</button>
        <button v-if="searchText" class="btn btn-cancel" @click="clearSearch">清除</button>
      </div>
    </div>

    <div class="card">
      <h3>用户列表</h3>
      <table v-if="users.length > 0">
        <thead>
          <tr><th>ID</th><th>姓名</th><th>邮箱</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td class="actions">
              <button class="btn btn-edit" @click="startEdit(user)">编辑</button>
              <button class="btn btn-danger" @click="handleDelete(user.id)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty">暂无用户数据</div>
      <div v-if="totalPages > 1" class="pagination">
        <span class="page-info">共 {{ total }} 条，第 {{ page }} / {{ totalPages }} 页</span>
        <div class="page-btns">
          <button class="btn-page" :disabled="page <= 1" @click="goToPage(page - 1)">上一页</button>
          <button class="btn-page" :disabled="page >= totalPages" @click="goToPage(page + 1)">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import type { User } from "../types/user"
import { getUsers, createUser, updateUser, deleteUser } from "../api/users"

const users = ref<User[]>([])
const searchText = ref("")
const page = ref(1)
const pageSize = ref(5)
const total = ref(0)
const totalPages = ref(0)

function loadUsers() {
  getUsers({
    search: searchText.value || undefined,
    page: page.value,
    pageSize: pageSize.value,
  }).then((res) => {
    const data = res.data
    if (Array.isArray(data)) {
      users.value = data
      total.value = data.length
      totalPages.value = 1
    } else {
      users.value = data.users ?? []
      total.value = data.total ?? 0
      page.value = data.page ?? 1
      totalPages.value = data.totalPages ?? 0
    }
  })
}

onMounted(loadUsers)

function handleSearch() {
  page.value = 1
  loadUsers()
}

function clearSearch() {
  searchText.value = ""
  handleSearch()
}

function goToPage(p: number) {
  page.value = p
  loadUsers()
}

const editingId = ref<number | null>(null)
const form = reactive({ name: "", email: "" })

function handleAdd() {
  if (!form.name || !form.email) {
    alert("请填写姓名和邮箱")
    return
  }
  if (editingId.value) {
    updateUser(editingId.value, { name: form.name, email: form.email })
      .then((res) => {
        const idx = users.value.findIndex((u) => u.id === editingId.value)
        if (idx !== -1) users.value[idx] = res.data
        cancelEdit()
      })
  } else {
    createUser({ name: form.name, email: form.email })
      .then(() => loadUsers())
    form.name = ""
    form.email = ""
  }
}

function handleDelete(id: number) {
  deleteUser(id).then(() => loadUsers())
}

function startEdit(user: User) {
  editingId.value = user.id
  form.name = user.name
  form.email = user.email
}

function cancelEdit() {
  editingId.value = null
  form.name = ""
  form.email = ""
}
</script>

<style scoped>
.container { max-width: 720px; margin: 40px auto; padding: 0 20px; }
.page-title { font-size: 24px; margin-bottom: 24px; }
.card { background: #fff; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.card h3 { font-size: 16px; margin-bottom: 16px; color: #666; }
.form-row { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.search-row { display: flex; gap: 8px; }
.search-row .input { max-width: 300px; }
.input { flex: 1; min-width: 160px; padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; outline: none; }
.input:focus { border-color: #409eff; }
.btn { padding: 10px 20px; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; white-space: nowrap; }
.btn-primary { background: #409eff; color: #fff; }
.btn-primary:hover { background: #337ecc; }
.btn-cancel { background: #909399; color: #fff; }
.btn-cancel:hover { background: #73767a; }
.btn-edit { background: #e6a23c; color: #fff; padding: 6px 14px; font-size: 13px; margin-right: 6px; }
.btn-edit:hover { background: #cf9236; }
.btn-danger { background: #f56c6c; color: #fff; padding: 6px 14px; font-size: 13px; }
.btn-danger:hover { background: #d9544f; }
.actions { white-space: nowrap; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 12px 8px; border-bottom: 1px solid #eee; font-size: 14px; }
th { color: #666; font-weight: 500; }
tr:hover td { background: #fafafa; }
.empty { text-align: center; color: #999; padding: 40px 0; font-size: 14px; }
.pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee; }
.page-info { font-size: 13px; color: #999; }
.page-btns { display: flex; gap: 8px; }
.btn-page { padding: 6px 14px; border: 1px solid #ddd; border-radius: 4px; background: #fff; font-size: 13px; cursor: pointer; color: #333; }
.btn-page:hover { border-color: #409eff; color: #409eff; }
.btn-page:disabled { color: #ccc; border-color: #eee; cursor: not-allowed; }
</style>
