<template>
  <div>
    <form @submit.prevent="onUpdateFarmSubmit">
      <div class="card">
        <div class="header mb-1">
          <h4 class="title pull-left">Basic information</h4>
          <div class="row pull-right" v-if="isEdit">
            <div class="col-lg-6">
              <label>Created:</label>
              <span class="monospace no-wrap">{{ farm.dateCreated | datetime }}</span>
            </div>
            <div class="col-lg-6">
              <label>Modified:</label>
              <span class="monospace mr-2">{{ farm.dateModified | datetime }}</span>
            </div>
          </div>
          <div class="clearfix"></div>
        </div>
        <div class="content">
          <div class="row">
            <div class="col-lg-6">
              <div class="row">
                <div class="col-lg-4">
                  <fg-input label="Name" placeholder="Name" v-model="farm.name"/>
                </div>
                <div class="col-lg-4" v-if="isAdmin">
                  <fg-select label="User" v-model="farm.userId" :options="users"/>
                </div>
                <div class="col-lg-4">
                  <fg-input label="Address" placeholder="Address" v-model="farm.address"/>
                </div>
              </div>
              <div class="row">
                <div class="col-lg-4">
                  <fg-select label="City" v-model="farm.cityId" :options="cities"/>
                </div>
                <div class="col-lg-4">
                  <fg-input
                    label="Latitude"
                    placeholder="Latitude"
                    v-model="farm.latitude"
                    :mask-options="DecimalMask"
                  />
                </div>
                <div class="col-lg-4">
                  <fg-input
                    label="Longitude"
                    placeholder="Longitude"
                    v-model="farm.longitude"
                    :mask-options="DecimalMask"
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-lg-4">
                  <fg-select label="Ruleset" v-model="farm.ruleSetId" :options="rulesets"/>
                </div>
              </div>
              <div class="row">
                <div class="col-lg-12">
                  <div class="form-group">
                    <label>Description</label>
                    <textarea
                      class="form-control border-input"
                      v-model="farm.description"
                      :rows="8"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-6">
              <div class="row">
                <div class="col-lg-12">
                  <google-map
                    :longitude="farmLongitude"
                    :latitude="farmLatitude"
                    :title="farm.name"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row" v-if="isAdmin">
        <div class="col-lg-4">
          <div class="card card-sm-fixed">
            <div class="header">
              <h4 class="title">Sensors</h4>
            </div>
            <div class="content">
              <div class="row">
                <div class="col-lg-12">
                  <fg-input type="text" placeholder="Filter" v-model="filterSensorQuery"/>
                </div>
              </div>
              <div class="row">
                <div class="col-lg-12" v-for="(sensor, idx) in sensors" :key="idx">                  
                  <fg-checkbox v-model="farm.sensorIds" :value="sensor.value" :label="sensor.text"/>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card card-sm-fixed">
            <div class="header">
              <h4 class="title">Plants</h4>
            </div>
            <div class="content">
              <div class="row">
                <div class="col-lg-12">
                  <fg-input type="text" placeholder="Filter" v-model="filterPlantQuery"/>
                </div>
              </div>
              <div class="row">
                <div class="col-lg-12" v-for="(plant, idx) in filteredPlants" :key="idx">
                  <fg-checkbox v-model="farm.plantIds" :value="plant.value" :label="plant.text"/>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card card-sm-fixed">
            <div class="header">
              <h4 class="title">Actuators</h4>
            </div>
            <div class="content">
              <div class="row">
                <div class="col-lg-12">
                  <fg-input type="text" placeholder="Filter" v-model="filterActuatorQuery"/>
                </div>
              </div>
              <div class="row">
                <div class="col-lg-12" v-for="(actuator, idx) in filteredActuators" :key="idx">
                  <fg-checkbox
                    v-model="farm.actuatorIds"
                    :value="actuator.value"
                    :label="actuator.text"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row" v-if="isAdmin && isEdit">
          <div class="col-lg-12">
            <div class="card">
              <div class="header">
                <h4 class="title">Sensor Rules</h4>
                <a href="http://jsonlogic.com/" target="_blank">jsonlogic</a>
              </div>
              <div class="content">
                <div class="row">
                  <div class="col-lg-12" v-for="(sensorRule, idx) in sensorsRules" :key="idx">
                    <fg-input type="text" :label="sensorRule.text" :value="sensorRule.conditions" v-model="sensorsRules[idx].conditions" />
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
      <div class="row">
        <div class="col-lg-12">
          <div class="text-center mt-1">
            <button
              type="button"
              class="btn btn-secondary btn-wd mr-1"
              @click="$router.push({ name: 'farms' })"
            >
              <span class="ti-arrow-left icon"></span>Back
            </button>
            <button type="submit" class="btn btn-info btn-fill btn-wd">
              <span class="ti-save icon"></span>Save
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
<script>
import { DecimalMask } from "utils/constants";

export default {
  data() {
    return {
      DecimalMask,
      filterSensorQuery: null,
      filterPlantQuery: null,
      filterActuatorQuery: null,
      users: [],
      cities: [],
      sensors: [],
      actuators: [],
      rulesets: [],
      plants: [],
      sensorsTypes:[],
      rules:[],
      sensorsRules:[],
      farm: {
        id: null,
        name: null,
        address: null,
        cityId: null,
        longitude: null,
        latitude: null,
        ruleSetId: null,
        sensorIds: [],
        actuatorIds: [],
        plantIds: []
      }
    };
  },
  computed: {
    filteredSensors() {
      return this.filterList(this.sensors, this.filterSensorQuery);
    },
    filteredPlants() {
      return this.filterList(this.plants, this.filterPlantQuery);
    },
    filteredActuators() {
      return this.filterList(this.actuators, this.filterActuatorQuery);
    },
    farmLatitude() {
      return Number(this.farm.latitude);
    },
    farmLongitude() {
      return Number(this.farm.longitude);
    },
    isEdit() {
      return this.$route.name === "edit-farm";
    },
    isCreate() {
      return this.$route.name === "create-farm";
    },
    isAdmin(){
      return this.$store.getters.isAdmin;
    }
  },
  methods: {
    filterList(list, filterQuery) {
      if (filterQuery != null && filterQuery !== "") {
        const by = (obj, prop) =>
          obj[prop].toLowerCase().indexOf(filterQuery.toLowerCase()) >= 0;
        return list.filter(x => by(x, "text"));
      }

      return list;
    },
    setSensorRule(data){
      
      if(data.label !== null && data.label !== undefined &&  data.label !== "")
      {     
        let sensorName = data.label.match(/\((.*)\)/);      
        if(sensorName !== null && sensorName !== undefined && sensorName.length > 0)
        {
          if(this.sensorsTypes !== null && this.sensorsTypes  !== undefined && Array.isArray(this.sensorsTypes) && this.sensorsTypes.length > 0)
          {
            let name =  sensorName[1];
            let sensor = this.sensorsTypes.find(x=>x.name == name);
            let sensorCode = sensor.code;

            let rule = this.rules.find(x=>x.code == sensorCode);
            if(rule !== null && rule !== undefined )
            {
              data.value = rule.conditions;
            }
           
          }         
        }          
      }   
    },
    getSensorRule(data){
      
      if(data.text !== null && data.text !== undefined &&  data.text !== "")
      {     
        let sensorName = data.text.match(/\((.*)\)/);      
        if(sensorName !== null && sensorName !== undefined && sensorName.length > 0)
        {
          if(this.sensorsTypes !== null && this.sensorsTypes  !== undefined && Array.isArray(this.sensorsTypes) && this.sensorsTypes.length > 0)
          {
            let name =  sensorName[1];
            let sensor = this.sensorsTypes.find(x=>x.name == name);
            let sensorCode = sensor.code;

            let rule = this.rules.find(x=>x.code == sensorCode);
            if(rule !== null && rule !== undefined )
            {
              return rule.conditions;
            }
           
          }         
        }
        return "";          
      }   
    },
    getSensorCode(data){
      
      if(data.text !== null && data.text !== undefined &&  data.text !== "")
      {     
        let sensorName = data.text.match(/\((.*)\)/);      
        if(sensorName !== null && sensorName !== undefined && sensorName.length > 0)
        {
          if(this.sensorsTypes !== null && this.sensorsTypes  !== undefined && Array.isArray(this.sensorsTypes) && this.sensorsTypes.length > 0)
          {
            let name =  sensorName[1];
            let sensor = this.sensorsTypes.find(x=>x.name == name);
            return sensor.code;          
          }         
        }
        return "";          
      }   
    },
    async onUpdateFarmSubmit() {
      try {
        if (this.isCreate) {
          await this.$api.createFarm(this.farm);
          this.$alert.success("Successfully created new farm");
          this.$router.push({ name: "farms" });
        } else {
          await Promise.all([ 
            this.$api.updateFarm(this.farm),
           this.$api.createOrUpdateFarmRules(this.farm.id,this.sensorsRules) 
          ]);

          this.$alert.success("Successfully updated farm data");
        }
      } catch (error) {
        this.$alert.error("Failed to update", error);
      }
    }
  },
  async created() {
    const response = await Promise.all([
      this.$api.getUserList(),
      this.$api.getSensorList(),
      this.$api.getCityList(),
      this.$api.getActuatorList(),
      this.$api.getRulesetList(),
      this.$api.getPlantList(),
      this.$api.getSensorTypes()
    ]);

    const data = response.map(x => x.data);
    this.users = data[0];
    this.sensors = data[1];
    this.cities = data[2];
    this.actuators = data[3];
    this.rulesets = data[4];
    this.plants = data[5];
    this.sensorsTypes = data[6];
    
    if (this.isEdit) 
    {
      const response = await this.$api.getFarm(this.$route.params.id);
      this.farm = response.data;
      const responseRules = await this.$api.getFarmRules(this.$route.params.id);     
      this.rules =  responseRules.data;
      let sensorsRulesArray = [];
      this.sensors.forEach(function(sensor) {
        sensorsRulesArray.push({
            text:sensor.text, 
            conditions: this.getSensorRule(sensor), 
            code: this.getSensorCode(sensor)
          });
      },this);  
      this.sensorsRules = sensorsRulesArray;   
    }

  }
};
</script>
<style>
</style>
