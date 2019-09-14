import Sidebar from './SideBar.vue'

const SidebarStore = {
  showSidebar: false,
  sidebarLinks: [
    {
      name: 'Dashboard',
      icon: 'ti-bar-chart',
      path: '/admin/overview',
      onlyAdmin: false
    },
    {
      name: 'Farms',
      icon: 'ti-home',
      path: '/admin/farms',
      onlyAdmin: false
    },
    {
      name: 'Users',
      icon: 'ti-user',
      path: '/admin/users',
      onlyAdmin: true
    }
  ],
  displaySidebar (value) {
    this.showSidebar = value
  }
}

const SidebarPlugin = {

  install (Vue) {
    Vue.mixin({
      data () {
        return {
          sidebarStore: SidebarStore
        }
      }
    })

    Object.defineProperty(Vue.prototype, '$sidebar', {
      get () {
        return this.$root.sidebarStore
      }
    })

    Vue.component('side-bar', Sidebar)
  }
}

export default SidebarPlugin
