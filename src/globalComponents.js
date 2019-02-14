import fgInput from './components/UIComponents/Inputs/formGroupInput.vue'
import fgSelect from './components/UIComponents/Inputs/formGroupSelect.vue'
import DropDown from './components/UIComponents/Dropdown.vue'
import GoogleMap from './components/UIComponents/Map.vue'

/**
 * You can register global components here and use them as a plugin in your main Vue instance
 */

const GlobalComponents = {
  install (Vue) {
    Vue.component('fg-input', fgInput)
    Vue.component('fg-select', fgSelect)
    Vue.component('drop-down', DropDown)
    Vue.component('google-map', GoogleMap)
  }
}

export default GlobalComponents