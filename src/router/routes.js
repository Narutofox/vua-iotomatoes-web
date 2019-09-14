import DashboardLayout from '../components/Dashboard/Layout/DashboardLayout.vue'

// GeneralViews
import LoginPage from '../components/GeneralViews/LoginPage.vue'
import NotFound from '../components/GeneralViews/NotFoundPage.vue'

// Admin pages
import Overview from 'src/components/Dashboard/Views/Overview.vue'
// import Notifications from 'src/components/Dashboard/Views/Notifications.vue'
// import Icons from 'src/components/Dashboard/Views/Icons.vue'
// import Maps from 'src/components/Dashboard/Views/Maps.vue'
// import Typography from 'src/components/Dashboard/Views/Typography.vue'
// import TableList from 'src/components/Dashboard/Views/TableList.vue'

// Farm pages
import Farms from 'src/components/Dashboard/Views/Farms.vue'
import FarmOverview from 'src/components/Dashboard/Views/Farms/FarmOverview.vue'
import EditFarmForm from 'src/components/Dashboard/Views/Farms/EditFarmForm.vue'

// User pages
import Users from 'src/components/Dashboard/Views/Users.vue'
import UserOverview from 'src/components/Dashboard/Views/Users/UserOverview.vue'
import EditProfileForm from 'src/components/Dashboard/Views/Users/EditProfileForm.vue'

// Live feed page
import LiveFeedIndex from 'src/components/Dashboard/Views/LiveFeed/Index.vue'

const routes = [
  {
    path: '/',
    component: DashboardLayout,
    redirect: '/admin/overview'
  },
  {
    path: '/admin',
    component: DashboardLayout,
    redirect: '/admin/overview',
    children: [
      {
        path: 'overview',
        name: 'overview',
        component: Overview
      },
      {
        path: 'live',
        name: 'live-feed',
        component: LiveFeedIndex
      },
      {
        path: 'profile',
        name: 'profile',
        component: EditProfileForm,
        meta: { userAuth: true }
      },
      {
        path: 'farms',
        component: Farms,
        redirect: '/admin/farms/overview',
        children: [
          {
            path: 'overview',
            name: 'farms',
            component: FarmOverview
          },
          {
            path: 'create',
            name: 'create-farm',
            component: EditFarmForm,
            meta: { adminAuth: true }
          },
          {
            path: ':id/edit',
            name: 'edit-farm',
            component: EditFarmForm
          }
        ]
      },
      {
        path: 'users',
        component: Users,
        redirect: '/admin/users/overview',
        children: [
          {
            path: 'overview',
            name: 'users',
            component: UserOverview
          },
          {
            path: 'create',
            name: 'create-user',
            component: EditProfileForm
          },
          {
            path: ':id/edit',
            name: 'edit-user',
            component: EditProfileForm
          }
        ],
        meta: { adminAuth: true }
      }
    ],
    meta: {
      requiresAuth: true
    }
  },
  { path: '/login', component: LoginPage, name: 'login' },
  { path: '*', component: NotFound }
]

/**
 * Asynchronously load view (Webpack Lazy loading compatible)
 * The specified component must be inside the Views folder
 * @param  {string} name  the filename (basename) of the view to load.
function view(name) {
   var res= require('../components/Dashboard/Views/' + name + '.vue');
   return res;
};**/

export default routes
