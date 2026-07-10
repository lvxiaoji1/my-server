<template>
  <div class="container" style="padding:20px;max-width:900px;margin:0 auto">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h1 style="margin:0">商品管理</h1>
      <el-button type="primary" @click="openDialog(null)">添加商品</el-button>
    </div>
    <el-table :data="products" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="price" label="价格" width="120"><template #default="s">¥{{ s.row.price }}</template></el-table-column>
      <el-table-column prop="stock" label="库存" width="80" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" width="170">
        <template #default="s">
          <el-button size="small" @click="openDialog(s.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(s.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="editingId?'编辑商品':'添加商品'" width="500px">
      <el-form :model="form" label-width="60px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="价格"><el-input-number v-model="form.price" :min="0.01" :precision="2" style="width:100%" /></el-form-item>
        <el-form-item label="库存"><el-input-number v-model="form.stock" :min="0" :precision="0" style="width:100%" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="submitProduct">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { getProducts, createProduct, updateProduct, deleteProduct } from "../api/products"
import { ElMessage, ElMessageBox } from "element-plus"
const products = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const form = reactive({ name: "", price: 0, stock: 0, description: "" })
function load() { loading.value = true; getProducts().then(r => products.value = r.data.products).finally(() => loading.value = false) }
onMounted(load)
function openDialog(row: any) {
  if (row) { editingId.value = row.id; form.name = row.name; form.price = row.price; form.stock = row.stock; form.description = row.description || "" }
  else { editingId.value = null; form.name = ""; form.price = 0; form.stock = 0; form.description = "" }
  dialogVisible.value = true
}
function submitProduct() {
  if (!form.name || form.price <= 0) { ElMessage.warning("请填写名称和价格"); return }
  const api = editingId.value ? updateProduct(editingId.value, form) : createProduct(form)
  api.then(() => { ElMessage.success(editingId.value ? "已更新" : "已创建"); dialogVisible.value = false; load() })
}
function handleDelete(id: number) {
  ElMessageBox.confirm("确定删除此商品？").then(() => deleteProduct(id).then(() => { ElMessage.success("已删除"); load() })).catch(() => {})
}
</script>
