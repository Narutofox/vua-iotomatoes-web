import { HubConnectionBuilder, LogLevel } from '@aspnet/signalr'
export default {
  install (Vue) {
    const connection = new HubConnectionBuilder()
      .withUrl(process.env.SIGNALR_URL + 'sensorMeasurementHub')
      .configureLogging(LogLevel.Information)
      .build()

    let startedPromise = null
    function start () {
      startedPromise = connection.start().catch(err => {
        console.error('Failed to connect with hub', err)
        return new Promise((resolve, reject) =>
            setTimeout(() => start().then(resolve).catch(reject), 5000))
      })
      return startedPromise
    }
    connection.onclose(() => start())

    start()

    const sensorMeasurementHub = new Vue()

// Forward server side SignalR events through $questionHub, where components will listen to them
    connection.on('SensorMeasurementNotification', (farmId) => {
      sensorMeasurementHub.$emit('NewSensorMeasurement', farmId)
    })

    sensorMeasurementHub.subscribe = (farmId) => {
      return startedPromise
          .then(() => connection.invoke('SensorMeasurementNotificationSubscribe', farmId))
          .catch(console.error)
    }
    sensorMeasurementHub.unSubscribe = (farmId) => {
      return startedPromise
          .then(() => connection.invoke('SensorMeasurementNotificationUnSubscribe', farmId))
          .catch(console.error)
    }

    // every component will use this.$sensorMeasurementHub to access the event bus
    Vue.prototype.$sensorMeasurementHub = sensorMeasurementHub
  }
}
