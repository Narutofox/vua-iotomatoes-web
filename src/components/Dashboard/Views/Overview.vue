<template>
  <div>

    <!--Stats cards-->
    <div class="row">
      <div class="col-lg-3 col-sm-6" v-for="(stats,index) in statsCards" :key="index">
        <stats-card>
          <div class="icon-big text-center" :class="`icon-${stats.type}`" slot="header">
            <i :class="stats.icon"></i>
          </div>
          <div class="numbers" slot="content">
            <p>{{stats.title}}</p>
            <span v-html="stats.value">{{stats.value}}</span>
          </div>
          <div class="stats" slot="footer">
            <i :class="stats.footerIcon"></i>
            {{stats.footerText}}
          </div>
        </stats-card>
      </div>
    </div>
    <hr>
    <!--Farm measurements form-->
        <div class="row mb-1">
      <form @submit.prevent="onFarmMeasurementsSubmit">
        <div class="col-lg-3 col-sm-6">
          <fg-select v-on:change="onFarmChange($event)" label="Farm" v-model="searchParams.farmId" :options="farmList" />
        </div>
        <div class="col-lg-3 col-sm-6">
          <fg-date
            v-show="!showRange"
            label="Date"
            :maxDate="new Date()"
            v-model="searchParams.dateFrom"
          />
          <fg-date
            v-show="showRange"
            label="Date range"
            :maxDate="new Date()"
            v-model="dateRangeComputed"
            range
          />
        </div>
        <div class="col-lg-6 col-sm-12">
          <div class="form-group">
            <span class="d-block" style="margin-top: .5rem">&nbsp;</span>
            <button class="btn btn-primary mr-1" type="submit">
              <span class="ti-filter icon"></span>Filter
            </button>
            <button class="btn btn-secondary mr-1" @click="resetSearchParams" type="button">
              <span class="ti-close icon"></span>Clear
            </button>
            <button class="btn btn-secondary" @click="onShowRangeChange" type="button">
              <span :class="`${showRange === true ? 'ti-minus' : 'ti-plus'} icon`"></span>
              Use range of dates
            </button>
          </div>
        </div>
      </form>
    </div>
    
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
    <!--  <div class="row" v-if="!isAdmin">
      
      <div class="col-lg-12">
        <chart-card :chart-data="soilHumiditySecondChartConfig.data" :chart-options="soilHumiditySecondChartConfig.options">
          <h4 class="title" slot="title">Soil Humidity</h4>
          <span slot="subTitle">Sensor measurements</span>
          <span slot="footer">
            <i class="ti-reload"></i>
            {{ refreshTimespan }}
          </span>
          <div slot="legend">
            <i class="fa fa-circle text-info"></i> Soil Humidity
          </div>
        </chart-card>
      </div>
    </div>-->
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
      refreshMeasurementInterval: null,
      refreshMinutesInterval: null,
      dateRange: [],
      searchParams: {
        farmId: null,
        dateFrom: null,
        dateTo: null
      },
      adminStatsCards: [
        {
          type: "warning",
          icon: "ti-user",
          title: "Users",
          value: "",
          footerText: "Updated now",
          footerIcon: "ti-reload"
        },
        {
          type: "success",
          icon: "ti-home",
          title: "Farms",
          value: "",
          footerText: "Last day",
          footerIcon: "ti-calendar"
        },
        {
          type: "info",
          icon: "ti-alert",
          title: "Warnings",
          value: "0",
          footerText: "Updated now",
          footerIcon: "ti-reload"
        },
        {
          type: "success",
          icon: "ti-server",
          title: "Status",
          value: "",
          footerText: this.refreshTimespan,
          footerIcon: "ti-timer"
        },
        {
          type: "warning",
          icon: "ti-shine",
          title: "Temperature",
          value: this.currentTemperature,
          footerText: this.lastMeasurmentDateTimeStampTemperature,
          footerIcon: "ti-reload"
        },
        {
          type: "warning",
          icon: "ti-light-bulb",
          title: "Light",
          value: this.currentLight,
          footerText: this.lastMeasurmentDateTimeStampLight,
          footerIcon: "ti-reload"
        },
        {
          type: "info",
          icon: "ti-cloud",
          title: "Air humidity",
          value: this.currentAirHumidity,
          footerText: this.lastMeasurmentDateTimeStampAirHumidity,
          footerIcon: "ti-reload"
        },
        {
          type: "success",
          icon: "ti-world",
          title: "Soil humidity",
          value: this.currentSoilHumidity,
          footerText: this.lastMeasurmentDateTimeStampSoilHumidity,
          footerIcon: "ti-reload"
        }
      ],
      humidityChartConfig: {},
      temperatureChartConfig: {},
      airHumidityChartConfig: {},
      soilHumidityChartConfig: {},
      soilHumiditySecondChartConfig: {}
    };
  },
  computed: {
    dateRangeComputed: {
      get() {
        return this.dateRange.join(" to ");
      },
      set(value) {
        (this.searchParams.dateFrom = value[0]),
          (this.searchParams.dateTo = value[1]),
          (this.dateRange = value);
      }
    },
    isAdmin() {
      return this.$store.getters.isAdmin;
    },
    statsCards() {
      return this.$store.getters.isAdmin
        ? this.adminStatsCards
        : this.userStatsCards;
    },
    userStatsCards() {
      return [
        {
          type: "warning",
          icon: "ti-shine",
          title: "Temperature",
          value: this.currentTemperature,
          footerText: this.lastMeasurmentDateTimeStampTemperature,
          footerIcon: "ti-reload"
        },
        {
          type: "warning",
          icon: "ti-light-bulb",
          title: "Light",
          value: this.currentLight,
          footerText: this.lastMeasurmentDateTimeStampLight,
          footerIcon: "ti-reload"
        },
        {
          type: "info",
          icon: "ti-cloud",
          title: "Air humidity",
          value: this.currentAirHumidity,
          footerText: this.lastMeasurmentDateTimeStampAirHumidity,
          footerIcon: "ti-reload"
        },
        {
          type: "success",
          icon: "ti-world",
          title: "Soil humidity",
          value: this.currentSoilHumidity,
          footerText: this.lastMeasurmentDateTimeStampSoilHumidity,
          footerIcon: "ti-reload"
        }
        /* {
          type: "success",
          icon: "ti-server",
          title: "Status",
          value: "Online",
          footerText: this.refreshTimespan,
          footerIcon: "ti-reload"
        } */
      ];
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
    lastMeasurmentDateTimeStampAirHumidity() {
      const airHum = this.getCurrentMeasurementDateTimeStamp(SensorType.AIR_HUMIDITY) || "";
      return `${airHum}`;
    },
    lastMeasurmentDateTimeStampLight() {
      const light = this.getCurrentMeasurementDateTimeStamp(SensorType.LIGHT) || "";
      return `${light}`;
    },

    lastMeasurmentDateTimeStampTemperature() {
      const temp = this.getCurrentMeasurementDateTimeStamp(SensorType.TEMPERATURE) || "";
      return `${temp}`;
    },

    lastMeasurmentDateTimeStampSoilHumidity() {
      const soilHum = this.getCurrentMeasurementDateTimeStamp(SensorType.SOIL_HUMIDITY) || "";
      return `${soilHum}`;
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
      if (!this.currentFarmStats || !Array.isArray(this.currentFarmStats) || this.currentFarmStats .length == 0) return null;
      //return this.currentFarmStats[sensorType];
      let measurementData = this.currentFarmStats.find(
        x => x.sensorTypeId === sensorType
      ).data;

      if(measurementData !== null && measurementData !== undefined && measurementData.length > 0){
         return measurementData[0];
      }
      return 0.00;
    },
    getCurrentMeasurementDateTimeStamp(sensorType) {
      if (!this.currentFarmStats || !Array.isArray(this.currentFarmStats) || this.currentFarmStats .length == 0 ) return null;
      //return this.currentFarmStats[sensorType];
      let measurementLabels = this.currentFarmStats.find(
        x => x.sensorTypeId === sensorType
      ).labels;

      if(measurementLabels !== null && measurementLabels !== undefined && measurementLabels.length > 0){
         return measurementLabels[0];
      }
      return null;
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
      if (this.farmMeasurements === null || !Array.isArray(this.farmMeasurements) || this.farmMeasurements.length == 0) 
      {
          return new Promise((resolve, reject) => {
            resolve({
              data: {
                labels: [],
                datasets: [
                  {
                    label: this.getChartLabel(sensorType),
                    data: [],
                    backgroundColor: this.getChartColor(sensorType),
                    borderColor: this.getChartColor(sensorType, "1"),
                    borderWidth: 1
                  }
                ]
              }
            });
          });
      }
      
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
    resetSearchParams() {
      this.searchParams.farmId = this.farmList[0].value;
      this.showRange = false;
      this.dateRange = [];
      this.searchParams.dateFrom = getFormattedDate(new Date());
      this.searchParams.dateTo = null;
      this.onFarmMeasurementsSubmit();
    },
    onShowRangeChange() {
      this.showRange = !this.showRange;
      if (this.showRange === false) {
        this.dateRange = [];
        this.searchParams.dateFrom = getFormattedDate(new Date());
      } else {
        this.searchParams.dateFrom = null;
      }
    },
    async setAdminStatsCards() {
      
      if(this.$store.getters.isAdmin)
      {
           this.updateCurrentUsersCountAdminStatsCards();
           this.updateCurrentFarmsCountAdminStatsCards();
           this.updateCurrentSoilHumidityAdminStatsCards();
           this.updateCurrentTemperatureAdminStatsCards();
           this.updateCurrentLightAdminStatsCards();
           this.updateCurrentAirHumidityAdminStatsCards();
           this.updateFarmStatusAdminStatsCards();
      }
    },
    async updateCurrentUsersCountAdminStatsCards()
    {
        const response = await Api.getUsers();
        const usersCount = response.data.length;
        const index = this.adminStatsCards.findIndex(x => x.title ==="Users");
        const userModel = {
          type: "warning",
          icon: "ti-user",
          title: "Users",
          value: usersCount.toString(),
          footerText: "Updated now",
          footerIcon: "ti-reload"
        }

        Vue.set(this.adminStatsCards, index, userModel);
    },
   async  updateCurrentFarmsCountAdminStatsCards()
    {
        const farmResponse = await Api.getFarms();
        const farmsCount = farmResponse.data.length;
        const farmIndex = this.adminStatsCards.findIndex(x => x.title ==="Farms");
        const farmModel = {
          type: "success",
          icon: "ti-home",
          title: "Farms",
          value: farmsCount.toString(),
          footerText: "Last day",
          footerIcon: "ti-calendar"
        }

        Vue.set(this.adminStatsCards, farmIndex, farmModel);
    },
    updateCurrentSoilHumidityAdminStatsCards(){
        const soilHumidityIndex = this.adminStatsCards.findIndex(x => x.title ==="Soil humidity");
        const soilHumidity = {
          type: "success",
          icon: "ti-world",
          title: "Soil humidity",
          value: this.currentSoilHumidity,
          footerText: this.lastMeasurmentDateTimeStampSoilHumidity,
          footerIcon: "ti-reload"
        }
        Vue.set(this.adminStatsCards, soilHumidityIndex, soilHumidity);
    },
    updateCurrentTemperatureAdminStatsCards(){
        const temperatureIndex = this.adminStatsCards.findIndex(x => x.title ==="Temperature");
        const temperature = {
          type: "warning",
          icon: "ti-shine",
          title: "Temperature",
          value: this.currentTemperature,
          footerText: this.lastMeasurmentDateTimeStampTemperature,
          footerIcon: "ti-reload"
        }
        Vue.set(this.adminStatsCards, temperatureIndex, temperature);
    },
    updateCurrentLightAdminStatsCards(){
        const index = this.adminStatsCards.findIndex(x => x.title ==="Light");
        const model = {
          type: "warning",
          icon: "ti-light-bulb",
          title: "Light",
          value: this.currentLight,
          footerText: this.lastMeasurmentDateTimeStampLight,
          footerIcon: "ti-reload"
        }
        Vue.set(this.adminStatsCards, index, model);
    },

    updateCurrentAirHumidityAdminStatsCards()
    {
        const index = this.adminStatsCards.findIndex(x => x.title ==="Air humidity");
        const model =       {
          type: "info",
          icon: "ti-cloud",
          title: "Air humidity",
          value: this.currentAirHumidity,
          footerText: this.lastMeasurmentDateTimeStampAirHumidity,
          footerIcon: "ti-reload"
        }
        Vue.set(this.adminStatsCards, index, model);
    },

    updateFarmStatusAdminStatsCards()
    {
        const index = this.adminStatsCards.findIndex(x => x.title ==="Status");
        let status = "Offline";
        let dateTimeStamp = "";

        if(this.isOnline(this.lastMeasurmentDateTimeStampTemperature))
        {
            status = "Online"
        }
        else if(this.isOnline(this.lastMeasurmentDateTimeStampLight))
        {
            status = "Online"
        }
        else if(this.isOnline(this.lastMeasurmentDateTimeStampAirHumidity))
        {
            status = "Online"
        }
        else if(this.isOnline(this.lastMeasurmentDateTimeStampSoilHumidity))
        {
            status = "Online"
        }

        const model =         
        {
          type: "success",
          icon: "ti-server",
          title: "Status",
          value: status,
          footerText: this.refreshTimespan,
          footerIcon: "ti-timer"
        };
        Vue.set(this.adminStatsCards, index, model);
    },
    isOnline(dateTimeStamp)
    {
        if(dateTimeStamp !== null && dateTimeStamp !== "")
        {
          let splitDateStemp = dateTimeStamp.split(".");
          let day = splitDateStemp[0];
          let month = splitDateStemp[1] - 1; // In javascript mounths are zero  based which meanse 0 is January
          let year = splitDateStemp[2].substring(0,4);
          let splitTimeStemp = splitDateStemp[2].split(" ")[1].split(":");
          let hours = splitTimeStemp[0];
          let minutes = splitTimeStemp[1];
          let dateObj =  new Date(year,month,day,hours,minutes,0,0);
          let today = new Date();
          let todayday = today.getDate();
          let todaymonth = today.getMonth();
          let todayyear = today.getFullYear();
          let days = this.dateDiffIndays(dateObj,today);

          if(days == 0 || days == 1 || days == -1)
          {
            return true;           
          }      
        }
        return false;
    },
    dateDiffIndays(date1, date2)
    {
      let diff =(date2.getTime() - date1.getTime()) / 1000;
      diff /= (60 * 60 * 24);
      return Math.abs(Math.round(diff));
    },
    async refreshFarmMeasurements() {
      await this.onFarmMeasurementsSubmit();
      await this.getCurrentFarmStats();
      this.setAdminStatsCards();
      this.minutesFromLastRefresh = 0;
    },
    refreshMinutes() {
      this.minutesFromLastRefresh += 1;
    },
    async getCurrentFarmStats() {
      const response = await this.$api.getLastFarmMeasurements(
        this.searchParams.farmId
      );
      this.currentFarmStats = response.data || {};
    },
    async onFarmMeasurementsSubmit() {
      const response = await this.$api.getFarmMeasurements(this.searchParams);

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
    },
    onNewSensorMeasurement(farmId)
    {       
        if(farmId === this.searchParams.farmId)
        {
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
      this.$sensorMeasurementHub.unSubscribe(this.searchParams.farmId);
      this.searchParams.farmId = newValue;
      this.$sensorMeasurementHub.subscribe(newValue);
      this.refreshFarmMeasurements();
    }
  },
  created() {
    this.$sensorMeasurementHub.$on('NewSensorMeasurement', this.onNewSensorMeasurement);
    this.refreshFarmMeasurements();

    this.refreshMinutesInterval = setInterval(this.refreshMinutes, 1000 * 60); // every minute
  },
  destroyed() {
    clearInterval(this.refreshMinutesInterval);
  },
  beforeDestroy () {
    // Make sure to cleanup SignalR event handlers when removing the component
    this.$sensorMeasurementHub.unSubscribe(this.searchParams.farmId);
    this.$sensorMeasurementHub.$off('NewSensorMeasurement');
  },


  async beforeMount() {
    const userId = this.$store.getters.userId;
    const response = await this.$api.getFarmListForUser(userId);
    this.farmList = response.data;
    this.resetSearchParams();
    this.refreshFarmMeasurements();
    this.$sensorMeasurementHub.subscribe(this.searchParams.farmId);
  }
};
</script>
<style>
</style>
