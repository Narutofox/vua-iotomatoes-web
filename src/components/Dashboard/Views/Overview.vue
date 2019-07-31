<template>
  <div>
    <div class="row mb-1" v-if="!isAdmin">
      <form @submit.prevent="onFarmMeasurementsSubmit">
        <div class="col-lg-3 col-sm-6">
          <fg-select label="Farm" v-model="searchParams.farmId" :options="farmList"/>
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
    <hr>
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

    <!--Charts-->
    <div class="row" v-if="!isAdmin">
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
    <div class="row" v-if="!isAdmin">
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
    <div class="row" v-if="!isAdmin">
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
          value: "Online",
          footerText: "In the last hour",
          footerIcon: "ti-timer"
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
          footerText: this.refreshTimespan,
          footerIcon: "ti-reload"
        },
        {
          type: "warning",
          icon: "ti-light-bulb",
          title: "Light",
          value: this.currentLight,
          footerText: this.refreshTimespan,
          footerIcon: "ti-reload"
        },
        {
          type: "info",
          icon: "ti-cloud",
          title: "Air humidity",
          value: this.currentAirHumidity,
          footerText: this.refreshTimespan,
          footerIcon: "ti-reload"
        },
        {
          type: "success",
          icon: "ti-world",
          title: "Soil humidity",
          value: this.currentSoilHumidity,
          footerText: this.refreshTimespan,
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
        //this.adminStatsCards[index].value = usersCount.toString();
        Vue.set(this.adminStatsCards, index, userModel);

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
      }
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
      const response = await this.$api.getCurrentFarmMeasurements(
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
    }
  },
  created() {
    this.refreshMeasurementInterval = setInterval(
      this.refreshFarmMeasurements,
      1000 * 60 * 5
    ); // every 5 minutes
    this.refreshMinutesInterval = setInterval(this.refreshMinutes, 1000 * 60); // every minute
    this.setAdminStatsCards();
  },
  destroyed() {
    clearInterval(this.refreshMeasurementInterval);
    clearInterval(this.refreshMinutesInterval);
  },
  async beforeMount() {
    const userId = this.$store.getters.userId;
    const response = await this.$api.getFarmListForUser(userId);
    this.farmList = response.data;
    this.resetSearchParams();
    this.refreshFarmMeasurements();
  }
};
</script>
<style>
</style>
