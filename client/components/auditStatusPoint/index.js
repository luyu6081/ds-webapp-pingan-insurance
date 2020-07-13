import AuditStatusPoint from './index.vue'

export default {
  ...AuditStatusPoint,
  install: Vue => Vue.component('auditStatusPoint', AuditStatusPoint),
}
