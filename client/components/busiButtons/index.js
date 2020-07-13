import BusiButtons from './busi-buttons.vue'

export default {
  ...BusiButtons,
  install: Vue => Vue.component('busiButtons', BusiButtons),
}
