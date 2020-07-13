import Expand from './expand.vue'

export default {
  ...Expand,
  install: Vue => Vue.component('expand', Expand),
}
