<template>
  <div class="container" style="padding:20px;max-width:1000px;margin:0 auto">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h1 style="margin:0">订单管理</h1>
      <div style="display:flex;gap:8px">
        <el-select v-model="statusFilter" clearable placeholder="全部状态" @change="loadOrders" style="width:140px">
          <el-option label="待处理" value="pending" /><el-option label="处理中" value="processing" />
          <el-option label="已发货" value="shipped" /><el-option label="已送达" value="delivered" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        <el-button type="primary" @click="openCreate" :disabled="!token">创建订单</el-button>
      </div>
    </div>
    <el-table :data="orders" v-loading="loading" border stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="user_name" label="用户" width="120" />
      <el-table-column prop="total" label="金额" width="120"><template #default="s">¥{{ Number(s.row.total).toFixed(2) }}</template></el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="s"><el-tag :type="statusType(s.row.status)" effect="dark">{{ statusLabel(s.row.status) }}</el-tag></template>
      </el-table-column>
      <el-table-column label="时间" width="170"><template #default="s">{{ formatDate(s.row.created_at) }}</template></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="s"><el-button size="small" @click="viewDetail(s.row)">详情</el-button></template>
      </el-table-column>
    </el-table>
    <el-pagination v-if="totalPages>0" :total="total" v-model:page-size="pageSize" v-model:current-page="page" @current-change="loadOrders" layout="prev,pager,next" background style="margin-top:20px;justify-content:center" />
  </div>
  <el-dialog v-model="detailVisible" title="订单详情" width="650px">
    <p v-if="detail">用户：{{ detail.user_name }} | 总额：¥{{ Number(detail.total).toFixed(2) }} | 状态：<el-tag :type="statusType(detail.status)" effect="dark" size="small">{{ statusLabel(detail.status) }}</el-tag></p>
    <el-table :data="detail?.items||[]" border size="small" style="margin-top:12px">
      <el-table-column prop="product_name" label="商品" />
      <el-table-column prop="quantity" label="数量" width="80" />
      <el-table-column prop="price" label="单价" width="100"><template #default="s">¥{{ Number(s.row.price).toFixed(2) }}</template></el-table-column>
      <el-table-column label="小计" width="100"><template #default="s">¥{{ (Number(s.row.price)*s.row.quantity).toFixed(2) }}</template></el-table-column>
    </el-table>
    <div v-if="detail&&canUpdate(detail.status)" style="margin-top:16px;display:flex;gap:8px">
      <template v-for="s in nextStatuses(detail.status)" :key="s">
        <el-button :type="s==='cancelled'?'danger':'primary'" size="small" @click="updateStatus(detail.id,s)">{{ statusLabel(s) }}</el-button>
      </template>
    </div>
  </el-dialog>
  <el-dialog v-model="createVisible" title="创建订单" width="600px">
    <div v-for="(item,i) in cart" :key="i" style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
      <el-select v-model="item.product_id" placeholder="选择商品" filterable style="flex:1">
        <el-option v-for="p in allProducts" :key="p.id" :label="`${p.name} (¥${p.price} 库存:${p.stock})`" :value="p.id" />
      </el-select>
      <el-input-number v-model="item.quantity" :min="1" :max="999" style="width:130px" />
      <el-button type="danger" size="small" @click="cart.splice(i,1)">×</el-button>
    </div>
    <el-button type="primary" @click="cart.push({product_id:null,quantity:1})">添加商品</el-button>
    <template #footer><el-button @click="createVisible=false">取消</el-button><el-button type="primary" @click="submitOrder">创建订单</el-button></template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue"
import { getOrders, getOrderById, createOrder, updateOrderStatus } from "../api/orders"
import { getProducts } from "../api/products"
import { ElMessage } from "element-plus"

const token = !!localStorage.getItem("token")
const orders = ref<any[]>([]); const loading = ref(false)
const page = ref(1); const pageSize = ref(10); const total = ref(0); const totalPages = ref(0)
const statusFilter = ref("")
const detailVisible = ref(false); const detail = ref<any>(null)
const createVisible = ref(false); const cart = ref<any[]>([]); const allProducts = ref<any[]>([])

function loadOrders() { loading.value = true; getOrders({ status: statusFilter.value || undefined, page: page.value, pageSize: pageSize.value }).then(r => { orders.value = r.data.orders; total.value = r.data.total; totalPages.value = r.data.totalPages }).finally(() => loading.value = false) }
onMounted(loadOrders)

function viewDetail(row: any) { getOrderById(row.id).then(r => detail.value = r.data); detailVisible.value = true }
function statusType(s: string) { return { pending: "warning", processing: "primary", shipped: "", delivered: "success", cancelled: "info" }[s] as any || "info" }
function statusLabel(s: string) { return { pending: "待处理", processing: "处理中", shipped: "已发货", delivered: "已送达", cancelled: "已取消" }[s] || s }
function canUpdate(s: string) { return ["pending", "processing", "shipped"].includes(s) }
function nextStatuses(s: string) { return { pending: ["processing", "cancelled"], processing: ["shipped", "cancelled"], shipped: ["delivered", "cancelled"] }[s] || [] }
function updateStatus(id: number, status: string) { updateOrderStatus(id, status).then(() => { ElMessage.success("状态已更新"); detailVisible.value = false; loadOrders() }) }
function formatDate(d: string) { return new Date(d).toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) }

function openCreate() {
  getProducts({ pageSize: 100 }).then(r => allProducts.value = r.data.products)
  cart.value = [{ product_id: null, quantity: 1 }]
  createVisible.value = true
}
function submitOrder() {
  const items = cart.value.filter(i => i.product_id)
  if (items.length === 0) { ElMessage.warning("请至少选择一个商品"); return }
  createOrder({ items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })) })
    .then(() => { ElMessage.success("订单已创建"); createVisible.value = false; loadOrders() })
    .catch(e => { ElMessage.error(e.response?.data?.error || "创建失败") })
}
</script>
