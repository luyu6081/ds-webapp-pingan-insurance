import Download from './download.vue'

export default {
  ...Download,
  install: Vue => Vue.component('download', Download),
}
