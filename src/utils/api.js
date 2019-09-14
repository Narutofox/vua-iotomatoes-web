import axios from 'axios'
import app from '../main'
import { HttpStatusCode } from './constants'

const instance = axios.create({
  // Proxy table webpackDevServer property inside config folder index.js proxies our request to .NET Core server
  baseURL: process.env.BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

instance.interceptors.request.use(config => {
  app.$Progress.start()
  return config
})

instance.interceptors.response.use(
  response => {
    app.$Progress.finish()
    return response
  },
  error => {
    app.$Progress.fail()

    if (error.status === HttpStatusCode.UNAUTHORIZED && error.config && !error.config.__isRetryRequest) {
      app.$store.dispatch('logout')
    }

    throw error
  }
)

export const Api = {
  // User API
  loginUser: user => instance.post('/users/login', user),
  updateUser: user => instance.put('/users', user),
  updateUserStatus: id => instance.put(`/users/${id}/status`),
  createUser: user => instance.post('/users', user),
  getFarmsForUser: id => instance.get(`/users/${id}/farms`),
  getFarmListForUser: id => instance.get(`/users/${id}/farms/list`),
  getUser: id => instance.get(`/users/${id}`),
  getUsers: () => instance.get('/users'),
  getUserList: () => instance.get('/users/list'),

  // Farm API
  createFarm: farm => instance.post('/farms', farm),
  updateFarm: farm => instance.put('/farms', farm),
  getFarms: () => instance.get('/farms'),
  getFarm: id => instance.get(`/farms/${id}`),
  getFarmList: () => instance.get('/farms/list'),

  // Sensor API
  getSensors: () => instance.get('/sensors'),
  getSensorList: () => instance.get('/sensors/list'),

  // City API
  getCities: () => instance.get('/cities'),
  getCityList: () => instance.get('/cities/list'),

  // Actuator API
  getActuators: () => instance.get('/actuators'),
  getActuatorList: () => instance.get('/actuators/list'),

  // Ruleset API
  getRulesets: () => instance.get('/rulesets'),
  getRulesetList: () => instance.get('/rulesets/list'),

  // Ruleset API
  getPlants: () => instance.get('/plants'),
  getPlantList: () => instance.get('/plants/list'),

  // SensorMeasurement API
  getFarmMeasurements: params => instance.get('/sensorMeasurements', { params }),
  getLastFarmMeasurements: farmId => instance.get('/sensorMeasurements/current', { params: { farmId } })
}

export default {
  install (Vue) {
    Object.defineProperty(Vue.prototype, '$api', {
      get () {
        return Api
      }
    })
  }
}
