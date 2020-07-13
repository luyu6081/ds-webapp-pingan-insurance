<template>
  <div class="global-stat-info">
    <div v-for="(item, index) in statInfos" :key="index" class="flex-1 text-center">
      <p class="global-stat-info-name">{{item.title}}</p>
      <div class="text-gray-dark text-sm relative">
        <i :class="['stat-value', {'text-blue': index == 0}, {'text-green': index == 1}, {'text-red': index == 2}]">{{item.num}}</i>
        <span v-if="item.num" class="stat-unit">个</span>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'GlobalStatInfo',

    props: {
      data: Object,
    },

    computed: {
      statInfos () {
        const _infoItemCount = {
          title: '累计信息项',
          num: this.data.infoItemCount,
        }
        const _landingInfoItemCount = {
          title: '落地信息项',
          num: this.data.landingInfoItemCount,
        }
        const _failingStandardCount = {
          title: '标准检查异常数',
          num: this.data.failingStandardCount,
        }
        return [_infoItemCount, _landingInfoItemCount, _failingStandardCount]
      },
    },
  }
</script>

<style lang="scss" scoped>
  .global-stat-info {
    @apply bg-white flex;

    padding: 16px 0 4px;

    &-name {
      @apply text-gray-darker text-sm;
    }

    .stat-value {
      @apply tracking-wider not-italic font-bold;

      font-size: 30px;
    }

    .stat-unit {
      @apply absolute text-gray-darkest text-base;

      bottom: 10px;
      margin-left: 8px;
    }
  }
</style>
