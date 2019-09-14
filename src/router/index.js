import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'
import store from '../store'

Vue.use(VueRouter)

// configure router
const router = new VueRouter({
  mode: 'history',
  routes,
  linkActiveClass: 'active'
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const isAuthenticated = store.getters.isAuthenticated
    const isAdmin = store.getters.isAdmin

    if (!isAuthenticated) {
      return next('/login')
    } else if (to.matched.some(record => record.meta.adminAuth) && !isAdmin) {
      return next({ name: 'overview' })
    } else if (to.matched.some(record => record.meta.userAuth) && isAdmin) {
      return next({ name: 'overview' })
    }

    next()
  } else {
    next()
  }
})

export default router
