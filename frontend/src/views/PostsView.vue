<template>
  <div class="container">
    <div class="header-row">
      <h1 class="page-title">文章管理</h1>
      <button v-if="token" class="btn btn-primary" @click="openForm(null)">写文章</button>
    </div>

    <div v-if="showForm" class="card">
      <h3>{{ editingPost ? "编辑文章" : "写文章" }}</h3>
      <input v-model="form.title" placeholder="请输入标题" class="input" />
      <textarea v-model="form.content" placeholder="请输入内容" class="textarea" rows="6"></textarea>
      <div class="form-actions">
        <button class="btn btn-primary" @click="handleSubmit">{{ editingPost ? "保存" : "发布" }}</button>
        <button class="btn btn-cancel" @click="showForm = false">取消</button>
      </div>
    </div>

    <div v-if="posts.length === 0 && !loading" class="empty">暂无文章</div>
    <div v-if="loading" class="empty">加载中...</div>

    <div v-for="post in posts" :key="post.id" class="post-card" @click="togglePost(post.id)">
      <div class="post-header">
        <h3>{{ post.title }}</h3>
        <span class="post-meta">{{ post.author_name }} · {{ formatDate(post.created_at) }}</span>
      </div>
      <div v-if="expandedId === post.id" class="post-body" @click.stop>
        <p class="post-content">{{ post.content }}</p>

        <router-link :to="`/posts/${post.id}`" class="detail-link">查看全文 →</router-link>
        <div v-if="token && currentUserId === post.user_id" class="post-actions">
          <button class="btn btn-edit" @click="openForm(post)">编辑</button>
          <button class="btn btn-danger" @click="handleDelete(post.id)">删除</button>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <span class="page-info">共 {{ total }} 条，第 {{ page }} / {{ totalPages }} 页</span>
      <div class="page-btns">
        <button class="btn-page" :disabled="page <= 1" @click="goToPage(page - 1)">上一页</button>
        <button class="btn-page" :disabled="page >= totalPages" @click="goToPage(page + 1)">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { getPosts, createPost, updatePost, deletePost } from "../api/posts"

const token = !!localStorage.getItem("token")
const userStr = localStorage.getItem("user")
const currentUserId = userStr ? JSON.parse(userStr).id : null

const posts = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(0)
const expandedId = ref<number | null>(null)
const showForm = ref(false)
const editingPost = ref<any>(null)

const form = reactive({ title: "", content: "" })

function loadPosts() {
  loading.value = true
  getPosts({ page: page.value, pageSize: pageSize.value })
    .then((res) => {
      posts.value = res.data.posts
      total.value = res.data.total
      totalPages.value = res.data.totalPages
    })
    .finally(() => { loading.value = false })
}

onMounted(loadPosts)

function togglePost(id: number) {
  expandedId.value = expandedId.value === id ? null : id
}

function openForm(post: any) {
  if (post) {
    editingPost.value = post
    form.title = post.title
    form.content = post.content
  } else {
    editingPost.value = null
    form.title = ""
    form.content = ""
  }
  showForm.value = true
}

function handleSubmit() {
  if (!form.title || !form.content) {
    alert("请填写标题和内容")
    return
  }
  if (editingPost.value) {
    updatePost(editingPost.value.id, { title: form.title, content: form.content })
      .then(() => {
        showForm.value = false
        loadPosts()
      })
  } else {
    createPost({ title: form.title, content: form.content })
      .then(() => {
        showForm.value = false
        loadPosts()
      })
  }
}

function handleDelete(id: number) {
  if (!confirm("确定删除这篇文章？")) return
  deletePost(id).then(() => loadPosts())
}

function goToPage(p: number) {
  page.value = p
  loadPosts()
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("zh-CN", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}
</script>

<style scoped>
.container { max-width: 720px; margin: 40px auto; padding: 0 20px; }
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-title { font-size: 24px; margin: 0; }
.btn {
  padding: 10px 20px; border: none; border-radius: 6px;
  font-size: 14px; cursor: pointer; white-space: nowrap;
}
.btn-primary { background: #409eff; color: #fff; }
.btn-primary:hover { background: #337ecc; }
.btn-cancel { background: #909399; color: #fff; }
.btn-cancel:hover { background: #73767a; }
.btn-edit { background: #e6a23c; color: #fff; padding: 6px 14px; font-size: 13px; margin-right: 6px; }
.btn-edit:hover { background: #cf9236; }
.btn-danger { background: #f56c6c; color: #fff; padding: 6px 14px; font-size: 13px; }
.btn-danger:hover { background: #d9544f; }
.card {
  background: #fff; border-radius: 8px; padding: 20px;
  margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.card h3 { font-size: 16px; margin-bottom: 16px; color: #666; }
.input {
  width: 100%; padding: 10px 14px; border: 1px solid #ddd;
  border-radius: 6px; font-size: 14px; outline: none; box-sizing: border-box; margin-bottom: 12px;
}
.input:focus { border-color: #409eff; }
.textarea {
  width: 100%; padding: 10px 14px; border: 1px solid #ddd;
  border-radius: 6px; font-size: 14px; outline: none; box-sizing: border-box; resize: vertical;
  font-family: inherit; margin-bottom: 12px;
}
.textarea:focus { border-color: #409eff; }
.form-actions { display: flex; gap: 8px; }
.post-card {
  background: #fff; border-radius: 8px; padding: 16px 20px;
  margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  cursor: pointer; transition: box-shadow 0.2s;
}
.post-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
.post-header h3 { margin: 0 0 6px 0; font-size: 16px; color: #333; }
.post-meta { font-size: 13px; color: #999; }
.post-body { margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee; }
.post-content { font-size: 14px; line-height: 1.6; color: #555; white-space: pre-wrap; }
.post-actions { margin-top: 12px; }
.empty { text-align: center; color: #999; padding: 60px 0; font-size: 14px; }
.pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; }
.page-info { font-size: 13px; color: #999; }
.page-btns { display: flex; gap: 8px; }
.btn-page {
  padding: 6px 14px; border: 1px solid #ddd; border-radius: 4px;
  background: #fff; font-size: 13px; cursor: pointer; color: #333;
}
.btn-page:hover { border-color: #409eff; color: #409eff; }
.btn-page:disabled { color: #ccc; border-color: #eee; cursor: not-allowed; }
</style>
