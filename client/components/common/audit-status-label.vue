<template>
  <span :class="[auditStatus, 'common-audit-status-label']">{{ DsAuditStatus[auditStatus] }}</span>
</template>

<script>

  import {DsAuditStatus} from '~/components/standard-audit/detail/data'

  export default {
    props: {
      auditStatus: String,
    },
    data () {
      return {
        DsAuditStatus,
      }
    },
  }
</script>

<style lang="scss">
  .common-audit-status-label {
    @apply relative;

    padding-left: 12px;
    box-sizing: border-box;

    &::before {
      @apply absolute left-0;

      content: '';
      width: 4px;
      height: 4px;
      top: 6px;

    }

    &.AUDITING {
      &::before {
        background-color: #FAAD14;
      }
    }

    &.UNAUDITED,
    &.REJECTED {
      &::before {
        background-color: #999999;
      }
    }

    &.PASSED {
      &::before {
        background-color: #52C41A;
      }
    }
  }
</style>
