import SpecLayout from './speclayout.vue'

export default {
  ...SpecLayout,
  install: Vue => Vue.component('specLayout', SpecLayout),
}
