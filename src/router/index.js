import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/')
  },
  {
    path: '/board',
    component: () => import('@/views/board')
  },
  {
    path: '/board/:info',
    component: () => import('@/views/board/info')
  },
  {
    path: '/board/:info/:article',
    component: () => import('@/views/board/article')
  },
  {
    path: '/search',
    component: () => import('@/views/board/search')
  },
  {
    path: '/admin/user',
    name: 'admin-user',
    component: () => import('@/views/admin/user')
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/settings')
  },
  {
    path: '/privacy',
    name: 'privacy',
    component: () => import('@/views/privacy')
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('@/views/terms')
  },
  {
    path: '/article',
    name: 'article',
    component: () => import('@/views/article')
  },
  {
    path: '/comment',
    name: 'comment',
    component: () => import('@/views/comment')
  },
  {
    path: '/user/:uid',
    name: 'user',
    component: () => import('@/views/user')
  },
  {
    path: '*',
    name: 'error',
    component: () => import('../views/error')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
