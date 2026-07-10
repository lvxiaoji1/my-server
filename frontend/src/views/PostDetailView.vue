<template>
  <div class="container">
    <router-link to="/posts" class="back-link">← 返回文章列表</router-link>
    <div v-if="loading" class="empty">加载中...</div>
    <div v-if="!post && !loading" class="empty">文章未找到</div>
    <div v-if="post" class="post-card">
      <h1 class="post-title">{{ post.title }}</h1>
      <p class="post-meta">{{ post.author_name }} · {{ formatDate(post.created_at) }}</p>
      <div class="post-content">{{ post.content }}</div>
      <div v-if="token && currentUserId === post.user_id" class="post-actions" style="margin-top:20px">
        <button class="btn btn-edit" @click="startEdit">编辑</button>
        <button class="btn btn-danger" @click="handleDelete">删除</button>
      </div>
      <div v-if="editing" class="edit-form">
        <input v-model="editForm.title" class="input" />
        <textarea v-model="editForm.content" class="textarea" rows="6"></textarea>
        <button class="btn btn-primary" @click="saveEdit">保存</button>
        <button class="btn btn-cancel" @click="editing = false">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPostById, updatePost, deletePost } from '../api/posts'

const route = useRoute()
const router = useRouter()
const token = !!localStorage.getItem('token')
const currentUserId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).id : null

const post = ref<any>(null)
const loading = ref(true)
const editing = ref(false)
const editForm = ref({ title: '', content: '' })

onMounted(() => {
  const id = parseInt(route.params.id as string, 10)
  getPostById(id).then((res) => {
    post.value = res.data
  }).catch(() => {
    post.value = null
  }).finally(() => {
    loading.value = false
  })
})

function startEdit() {
  editForm.value = { title: post.value.title, content: post.value.content }
  editing.value = true
}

function saveEdit() {
  updatePost(post.value.id, editForm.value).then((res) => {
    post.value = res.data
    editing.value = false
  })
}

function handleDelete() {
  if (!confirm('确定删除？')) return
  deletePost(post.value.id).then(() => router.push('/posts'))
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.container { max-width: 720px; margin: 40px auto; padding: 0 20px; }
.back-link { display: inline-block; margin-bottom: 20px; color: #409eff; text-decoration: none; font-size: 14px; }
.back-link:hover { text-decoration: underline; }
.post-card { background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.post-title { margin: 0 0 8px 0; font-size: 22px; }
.post-meta { font-size: 13px; color: #999; margin-bottom: 24px; }
.post-content { font-size: 15px; line-height: 1.8; color: #444; white-space: pre-wrap; }
.empty { text-align: center; color: #999; padding: 60px 0; font-size: 14px; }
.btn { padding: 10px 20px; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; }
.btn-primary { background: #409eff; color: #fff; }
.btn-edit { background: #e6a23c; color: #fff; padding: 6px 14px; font-size: 13px; margin-right: 6px; }
.btn-danger { background: #f56c6c; color: #fff; padding: 6px 14px; font-size: 13px; }
.btn-cancel { background: #909399; color: #fff; }
.input { width: 100%; padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; outline: none; box-sizing: border-box; margin-bottom: 12px; }
.textarea { width: 100%; padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; outline: none; box-sizing: border-box; resize: vertical; font-family: inherit; margin-bottom: 12px; }
.edit-form { margin-top: 16px; padding-top: 16px; border-top: 1px solid #eee; }
</style>
