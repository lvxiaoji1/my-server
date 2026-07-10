import { createRouter, createWebHashHistory } from "vue-router"
import UsersView from "../views/UsersView.vue"
import PostsView from "../views/PostsView.vue"
import ProductsView from "../views/ProductsView.vue"
import OrdersView from "../views/OrdersView.vue"
import AuthView from "../views/AuthView.vue"

const routes = [
  { path: "/", redirect: "/users" },
  { path: "/users", name: "users", component: UsersView },
  { path: "/posts", name: "posts", component: PostsView },
  { path: "/posts/:id", name: "post-detail", component: () => import("../views/PostDetailView.vue") },
  { path: "/products", name: "products", component: ProductsView },
  { path: "/orders", name: "orders", component: OrdersView },
  { path: "/auth", name: "auth", component: AuthView },
]

const router = createRouter({ history: createWebHashHistory(), routes })
export default router
