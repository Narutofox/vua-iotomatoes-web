<template>
  <div :class="{'nav-open': $sidebar.showSidebar}">
    <router-view></router-view>
    <vue-progress-bar></vue-progress-bar>
    <!--This sidebar appears only for screens smaller than 992px-->
    <side-bar type="navbar" :sidebar-links="sidebarLinks">
      <ul class="nav navbar-nav">
        <drop-down :title="$store.getters.username" icon="ti-user">
          <li>
            <router-link to="profile" tag="a">
              <i class="ti-settings"></i>Settings
            </router-link>
          </li>
          <li>
            <a @click="onLogoutClick">
              <i class="ti-power-off"></i>Logout
            </a>
          </li>
        </drop-down>
        <li class="divider"></li>
      </ul>
    </side-bar>
  </div>
</template>

<script>

  export default {
    computed: {
      isAuthenticated(){
        return this.$store.getters.isAuthenticated
      },
      sidebarLinks(){
        const sidebarLinks = this.$sidebar.sidebarLinks;
        return this.$store.getters.isAdmin ? sidebarLinks : sidebarLinks.filter(x => {
          if(x.onlyAdmin === false) return x;
        });
      }
    },
    methods: {
      async onLogoutClick(){
        await this.$store.dispatch('logout');
        this.$router.replace({ name: 'login' });
      },
    }
  }
</script>

<style lang="scss">
hr {
  border-top: 1px solid #ccc !important;
}

.no-wrap {
  white-space: nowrap;
}

.monospace {
  font-family: monospace;
}

.icon {
  margin-right: 0.8rem;
}

.m-0 {
  margin: 0px;
}

.mt-1 {
  margin-top: 1.2rem;
}

.mb-1 {
  margin-bottom: 1.2rem;
}

.mr-1 {
  margin-right: 1.2rem;
}

.mr-2 {
  margin-right: 2rem;
}

.ml-1 {
  margin-left: 1.2rem;
}

.d-block {
  display: block;
}

.d-inline {
  display: inline-block;
}

th {
  font-size: 100% !important;
  text-transform: uppercase;
  padding-bottom: 10px !important;
}

// th.identifier,
// td.identifier {
//   width: 80px;
//   text-align: center;
//   padding-right: 15px !important;
// }

.card.card-fixed {
  height: 500px;
  overflow-y: scroll;
}

.card.card-sm-fixed {
  height: 300px;
  overflow-y: scroll;
}

.card > .header {
  padding-left: 15px !important;
}

.map {
  border-radius: 10px;
  overflow: hidden;
  padding-top: 0px !important;
}

.content-fixed {
  height: 500px;
  overflow-y: scroll;
}

::-webkit-scrollbar {
  width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
