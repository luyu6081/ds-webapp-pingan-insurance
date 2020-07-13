<template>
  <div class="common-status-icon">
    {{ label }}
    <!-- <ej-icon v-if="status === 'ENABLE'" icon="play-circle-o"></ej-icon>
    <span v-if="status === 'DEACTIVATE'" class="stop-icon"></span> -->
  </div>
</template>

<script>
  export default {
    props: {
      status: String,
    },
    computed: {
      label () {
        if (this.status === undefined) return
        const statusObj = {
          'ENABLE': '启用',
          'DEACTIVATE': '禁用',
        }
        return statusObj[this.status]
      },
    },
  }
</script>

<style lang="scss">
  .common-status-icon {
    .ej-icon,
    .stop-icon {
      width: 14px;
      height: 14px;
    }

    .stop-icon {
      @apply inline-block relative;

      border-radius: 50%;
      box-sizing: border-box;
      border: 1px solid #999;

      &::before {
        @apply absolute bg-gray-dark;

        top: 4px;
        left: 4px;
        content: '';
        width: 4px;
        height: 4px;
      }
    }

  }
</style>
