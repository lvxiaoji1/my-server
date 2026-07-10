<template>
  <div class="container">
    <div class="auth-card">
      <div class="tabs">
        <button
          :class="['tab', { active: mode === 'login' }]"
          @click="mode = 'login'"
        >
          登录
        </button>
        <button
          :class="['tab', { active: mode === 'register' }]"
          @click="mode = 'register'"
        >
          注册
        </button>
      </div>

      <div class="form-group">
        <label>姓名</label>
        <input v-model="form.name" placeholder="请输入姓名" class="input" />
      </div>

      <div class="form-group">
        <label>邮箱</label>
        <input v-model="form.email" placeholder="请输入邮箱" class="input" />
      </div>

      <div class="form-group">
        <label>密码</label>
        <input v-model="form.password" type="password" placeholder="请输入密码" class="input" />
      </div>

      <p v-if="hint" class="hint">注册时姓名必填，密码至少6位</p>

      <button class="btn btn-primary btn-block" @click="handleSubmit" :disabled="loading">
        {{ loading ? '请求中...' : mode === 'login' ? '登录' : '注册' }}
      </button>

      <div v-if="result" class="box box-success">
        <pre>{{ JSON.stringify(result, null, 2) }}</pre>
      </div>
      <div v-if="error" class="box box-error">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { login, register } from '../api/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

const mode = ref<'login' | 'register'>('login')
const loading = ref(false)
const result = ref<any>(null)
const error = ref('')
const hint = ref(false)

const form = reactive({
  name: '',
  email: '',
  password: '',
})

watch(mode, () => {
  result.value = null
  error.value = ''
  hint.value = mode.value === 'register'
})

function handleSubmit() {
  result.value = null
  error.value = ''
  loading.value = true

  const api = mode.value === 'login' ? login : register
  const data = mode.value === 'login'
    ? { email: form.email, password: form.password }
    : { name: form.name, email: form.email, password: form.password }

  api(data)
    .then((res) => {
      result.value = res.data
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      router.push('/users')
    })
    .catch((err) => {
      const data = err.response?.data
      error.value = data?.fields
        ? data.fields.map((f: any) => f.message).join('; ')
        : data?.error || '请求失败'
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<style scoped>
.container {
  max-width: 440px;
  margin: 60px auto;
  padding: 0 20px;
}
.auth-card {
  background: #fff;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.tabs {
  display: flex;
  margin-bottom: 28px;
  border-bottom: 2px solid #eee;
}
.tab {
  flex: 1;
  padding: 10px;
  border: none;
  background: none;
  font-size: 16px;
  cursor: pointer;
  color: #999;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
}
.tab.active {
  color: #409eff;
  border-bottom-color: #409eff;
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
}
.input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}
.input:focus { border-color: #409eff; }
.hint {
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
}
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}
.btn-primary { background: #409eff; color: #fff; }
.btn-primary:hover { background: #337ecc; }
.btn-primary:disabled { background: #a0cfff; cursor: not-allowed; }
.btn-block { width: 100%; padding: 12px; font-size: 15px; }
.box {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 13px;
  overflow-x: auto;
}
.box-success {
  background: #f0f9eb;
  border: 1px solid #e1f3d8;
  color: #67c23a;
}
.box-error {
  background: #fef0f0;
  border: 1px solid #fde2e2;
  color: #f56c6c;
}
.box pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
