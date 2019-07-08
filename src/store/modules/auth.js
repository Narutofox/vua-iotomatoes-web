import { Api } from '../../utils/api'
import { UserRole } from '../../utils/constants'

const state = {
  user: null,
  expiresAt: 7200000 // 2 hours
}

const getters = {
  isAuthenticated: state => !!state.user,
  isAdmin: state => !state.user ? false : state.user.roleCode === UserRole.ADMINISTRATOR,
  username: state => state.user ? state.user.username : null,
  userId: state => state.user ? state.user.id : null
}

const mutations = {
  authSuccess (state, user) {
    state.user = user
  },
  updateUser (state, user) {
    state.user = user
  },
  authError (state) {
    state.user = null
  },
  logout (state) {
    state.user = null
  }
}

const actions = {
  setLogoutTimer ({ commit }, expiresAt) {
    setTimeout(() => {
      commit('logout')
    }, expiresAt)
  },
  async login ({ commit, dispatch, state }, user) {
    try {
      const response = await Api.loginUser(user)
      commit('authSuccess', response.data)
      dispatch('setLogoutTimer', state.expiresAt)
    } catch (error) {
      commit('authError')
      return Promise.reject(error)
    }
  },
  logout ({ commit }) {
    return new Promise((resolve, reject) => {
      commit('logout')
      resolve()
    })
  }
}

export default {
  state,
  getters,
  mutations,
  actions
}
