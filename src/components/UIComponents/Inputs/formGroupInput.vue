<template>
  <div class="form-group">
    <label v-if="label">{{label}}</label>
    <input :ref="inputId" class="form-control border-input" v-bind="$props" :value="value">
  </div>
</template>
<script>
import { getRandomInt } from "utils";
import Cleave from "cleave.js";

export default {
  props: {
    type: {
      type: String,
      default: "text"
    },
    label: String,
    name: String,
    disabled: Boolean,
    placeholder: String,
    value: [String, Number],
    maskOptions: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      inputId: "no-id",
      cleaveInstance: null
    };
  },
  computed: {
    isMaskDefined() {
      return Object.keys(this.maskOptions).length > 0;
    },
    inputElement() {
      return this.$refs[this.inputId];
    }
  },
  methods: {
    onInput(event) {
      const inputValue = event.target
        ? event.target.value
        : this.inputElement.value;
        
      this.$emit("input", inputValue);
      
      if(this.cleaveInstance != null) {
        this.$emit("maskInput", this.cleaveInstance.getRawValue());
      }
    },
    updateInputId() {
      const currentTime = new Date().getTime().toString();
      const randomInt = getRandomInt(0, currentTime);
      this.inputId = `input_${randomInt}`;
    }
  },
  watch: {
    maskOptions: {
      deep: true,
      handler(options) {
        this.cleaveInstance.destroy();
        this.cleaveInstance = new Cleave(this.inputElement, options);
      }
    }
  },
  beforeMount() {
    this.updateInputId();
  },
  mounted() {
    if (this.isMaskDefined) {
      this.cleaveInstance = new Cleave(this.inputElement, this.maskOptions);
      const { properties } = this.cleaveInstance;
      if (properties && properties.hasOwnProperty("result")) {
        this.$watch("cleaveInstance.properties.result", this.onInput);
      }
    } else {
      this.inputElement.addEventListener("input", this.onInput);
    }
    let obj = {label: this.label, value: this.value};
    this.$emit('input-mounted',obj);
  },
  beforeDestroy() {
    if(this.cleaveInstance != null) {
      this.cleaveInstance.destroy();
    }
  }
};
</script>
<style>
</style>
