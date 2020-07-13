<template>
  <span :style="{width: width + 'px', height: height + 'px'}" :class="['audit-status-point', statusColor]"></span>
</template>

<script>
  export default {
    name: 'AuditStatusPoint',

    props: {
      auditStatus: {
        type: String,
        required: true,
      },
      width: {
        type: Number,
        default: 4,
      },
      height: {
        type: Number,
        default: 4,
      },
    },

    computed: {
      statusColor () {
        let status = {
          one: 'orange',
          two: 'gray',
          three: 'green',
          fore: 'red',
        }
        return `bg-${status[this.auditStatus]}`
      },
    },
  }
</script>

<style lang="scss">
  .audit-status-point {
    @apply inline-block rounded-full;
  }
</style>
