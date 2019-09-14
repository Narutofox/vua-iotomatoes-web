<template>
  <div>
    <div class="row mb-1">
        <div class="col-lg-3 col-sm-6">
          <fg-select label="Farms" v-model="selected" :options="farmList" @change="onFarmChange" />
        </div>
    </div>
    <hr>

    <!--Charts-->
    <div class="row">
      <div class="col-lg-12">
        <chart-card
          :chart-data="airHumidityChartConfig.data"
          :chart-options="airHumidityChartConfig.options"
        >
          <h4 class="title" slot="title">Air humidity</h4>
          <span slot="subTitle">Sensor measurements</span>
          <span slot="footer">
            <i class="ti-reload"></i>
            {{ refreshTimespan }}
          </span>
        </chart-card>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-12">
        <chart-card
          :chart-data="temperatureChartConfig.data"
          :chart-options="temperatureChartConfig.options"
        >
          <h4 class="title" slot="title">Temperature</h4>
          <span slot="subTitle">Sensor measurements</span>
          <span slot="footer">
            <i class="ti-reload"></i>
            {{ refreshTimespan }}
          </span>
        </chart-card>
      </div>
    </div>
    <div class="row">
      <div class="col-lg-12">
        <chart-card
          :chart-data="soilHumidityChartConfig.data"
          :chart-options="soilHumidityChartConfig.options"
        >
          <h4 class="title" slot="title">Soil humidity</h4>
          <span slot="subTitle">Sensor measurements</span>
          <span slot="footer">
            <i class="ti-reload"></i>
            {{ refreshTimespan }}
          </span>
        </chart-card>
      </div>
    </div>
  </div>
</template>
<script>
import StatsCard from "components/UIComponents/Cards/StatsCard.vue";
import ChartCard from "components/UIComponents/Cards/ChartCard.vue";
import Vue from 'vue';
import { SensorType } from "utils/constants";
import { getFormattedDate } from "utils";
import { setInterval, clearInterval } from "timers";
import { debug } from "util";
import { Api } from 'utils/api';

export default {
  components: {
    StatsCard,
    ChartCard
  },
  data() {
    return {
      farmList: [],
      currentFarmStats: null,
      farmMeasurements: null,
      showRange: false,
      minutesFromLastRefresh: 0,
      dateRange: [],
      currentFarmId: 0,
      humidityChartConfig: {},
      temperatureChartConfig: {},
      airHumidityChartConfig: {},
      soilHumidityChartConfig: {},
      soilHumiditySecondChartConfig: {}
    };
  },
  computed: {
    isAdmin() {
      return this.$store.getters.isAdmin;
    },
    currentLight() {
      const light = this.getCurrentMeasurement(SensorType.LIGHT) || 0.00;
      return `${light}%`;
    },
    currentTemperature() {
      const temp = this.getCurrentMeasurement(SensorType.TEMPERATURE) || 0.00;
      return `${temp} &deg;C`;
    },
    currentSoilHumidity() {
      const soilHum = this.getCurrentMeasurement(SensorType.SOIL_HUMIDITY) || 0.00;
      return `${soilHum}%`;
    },
    currentAirHumidity() {
      const airHum = this.getCurrentMeasurement(SensorType.AIR_HUMIDITY) || 0.00;
      return `${airHum}%`;
    },
    refreshTimespan() {
      return this.minutesFromLastRefresh > 0
        ? `Updated ${this.minutesFromLastRefresh} ${
            this.minutesFromLastRefresh > 1 ? "minutes" : "minute"
          } ago`
        : `Updated now`;
    }
  },
  methods: {
    getCurrentMeasurement(sensorType) {
      if (!this.currentFarmStats) return null;
      return this.currentFarmStats[sensorType];
    },
    getChartLabel(sensorType) {
      switch (sensorType) {
        case SensorType.TEMPERATURE:
          return "Temperature";
        case SensorType.AIR_HUMIDITY:
          return "Air humidity (%)";
        case SensorType.SOIL_HUMIDITY:
          return "Soil humidity (%)";
        default:
          return "";
      }
    },
    getChartColor(sensorType, opacity = "0.2") {
      switch (sensorType) {
        case SensorType.TEMPERATURE:
          return `rgba(244, 188, 54, ${opacity})`;
        case SensorType.AIR_HUMIDITY:
          return `rgba(100, 179, 202, ${opacity})`;
        case SensorType.SOIL_HUMIDITY:
          return `rgba(65, 184, 131, ${opacity})`;
        default:
          return "";
      }
    },
    getChartConfiguration(sensorType) {
      if (this.farmMeasurements === null) return null;
      const measurement = this.farmMeasurements.find(
        x => x.sensorTypeId === sensorType
      );

      return new Promise((resolve, reject) => {
        resolve({
          data: {
            labels: measurement ? measurement.labels : [],
            datasets: [
              {
                label: this.getChartLabel(sensorType),
                data: measurement ? measurement.data : [],
                backgroundColor: this.getChartColor(sensorType),
                borderColor: this.getChartColor(sensorType, "1"),
                borderWidth: 1
              }
            ]
          }
        });
      });
    },

    async refreshFarmMeasurements() {
      await this.getCurrentFarmMeasurements();
      await this.getCurrentFarmStats();
      this.minutesFromLastRefresh = 0;
    },
    async getCurrentFarmStats() {
        if(this.currentFarmId === null || this.currentFarmId === undefined || this.currentFarmId <= 0){
            return;
        } 
      const response = await this.$api.getLastFarmMeasurements(this.currentFarmId);
      this.currentFarmStats = response.data || {};
    },
    async getCurrentFarmMeasurements() {
        if(this.currentFarmId === null || this.currentFarmId === undefined || this.currentFarmId <= 0){
            return;
        }      
      const response = await this.$api.getFarmMeasurements(this.currentFarmId);
      this.farmMeasurements = response.data;
      this.temperatureChartConfig = await this.getChartConfiguration(
        SensorType.TEMPERATURE
      );
      this.airHumidityChartConfig = await this.getChartConfiguration(
        SensorType.AIR_HUMIDITY
      );
      this.soilHumidityChartConfig = await this.getChartConfiguration(
        SensorType.SOIL_HUMIDITY
      );
      this.soilHumiditySecondChartConfig = await this.getChartConfiguration(
        SensorType.SOIL_HUMIDITY
      );
    }
  },
  created() {
    this.$sensorMeasurementHub.$on('NewSensorMeasurement', this.onNewSensorMeasurement)
  },
  beforeDestroy () {
    // Make sure to cleanup SignalR event handlers when removing the component
    this.$sensorMeasurementHub.unSubscribe(this.currentFarmId);
    },

   onNewSensorMeasurement({ farmId })
    {
        if(farmId === this.currentFarmId){
            this.refreshFarmMeasurements();
        }
    },
  onFarmChange(newValue) 
  {
      if(newValue === null || newValue === undefined || newValue <= 0)
      {
          console.error("newValue null or undefined or less then 0 newValue:" + newValue);
          return;
      }
    this.$sensorMeasurementHub.unSubscribe(this.currentFarmId);
    this.currentFarmId = newValue;
    this.$sensorMeasurementHub.subscribe(this.currentFarmId);
  },
  async beforeMount() {
    const userId = this.$store.getters.userId;
    const response = await this.$api.getFarmListForUser(userId);
    this.farmList = response.data;
    this.refreshFarmMeasurements();
    if(this.farmList !== null && this.farmList !== undefined && this.farmList.lenght > 0){
        this.currentFarmId = this.farmList[0].value;
        this.$sensorMeasurementHub.subscribe(this.currentFarmId);
    }       
  }
};
</script>
<style>
</style>
