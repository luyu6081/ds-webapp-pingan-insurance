<template>
  <div class="system-ranking">
    <!-- <div class="detail-btn">
      <router-link :to="{name: 'system-ranking-page'}">详情</router-link>
    </div> -->
    <h3 class="system-ranking-title clearfix">数据标准执行度系统排行</h3>
    <div class="rank-wrap pt-2 -mb-2">
      <div v-for="(item, idx) in data" :key="idx" class="rank-item">
        <span class="counter">{{item.Ranking}}</span>
        <router-link :to="{name: 'home'}" class="name">{{item.systemName}}</router-link>
        <div class="ground-info">
          <span class="floor-rate">落地率 {{item.landingInfoItemRank}}</span>
          <span>{{item.grade}}分</span>
        </div>
        <ej-icon :icon="item.waveNum ? item.waveNum < 0 ? 'arrow-down' : 'arrow-up' : 'minus'"
                 class="trend"
                 :class="item.waveNum ? item.waveNum < 0 ? 'text-red-light' : 'text-green-light' : 'text-gray'"/>
        <span :class="['text-gray-dark text-sm', {invisible: !item.waveNum}]">{{Math.abs(item.waveNum)}}名</span>
      </div>
    </div>
  </div>
</template>

<script>

  import {
    Icon as EjIcon,
  } from '@ej/ui'

  export default {
    name: 'SystemRanking',

    components: {
      EjIcon,
    },

    props: {
      data: Array,
    },
  }
</script>

<style lang="scss" scoped>
  .system-ranking {
    @apply bg-white relative;

    padding: 24px;

    &-title {
      @apply text-lg text-blue font-medium;
    }

    .detail-btn {
      @apply text-blue text-sm absolute;
      right: 24px;

      &:hover {
        @apply text-blue-light;
      }
    }

    .rank-item {
      @apply flex items-center;

      margin-top: 9px;
      line-height: 22px;

      .counter {
        @apply text-center;

        width: 18px;
        height: 18px;
        line-height: 18px;
      }

      .counter {
        @apply text-white rounded-full bg-gray;
      }

      &:nth-child(1) .counter {
        @apply bg-red;
      }

      &:nth-child(2) .counter {
        @apply bg-yellow;
      }

      &:nth-child(3) .counter {
        @apply bg-green;
      }

      .name {
        @apply text-gray-darkest truncate;

        width: 150px;
        margin: 0 8px;
      }

      .ground-info {
        @apply text-right text-gray-darker;

        .floor-rate {
          @apply inline-block;

          margin: 0 20px 0 10px;
        }
      }

      .trend {
        @apply text-center mx-2;

        width: 14px;
        height: 14px;
      }
    }
  }
</style>
