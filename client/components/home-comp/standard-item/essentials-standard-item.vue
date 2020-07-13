<template>
  <div class="tab-item">
    <h4 class="clearfix">
      <p class="tab-item-title">
        <router-link :to="{name: 'essentials', query:{id: itemData.id}}">{{itemData.name}}</router-link>
      </p>
      <div class="float-right flex w-5/12 tab-item-icon">
        <div class="text-sm mr-2 w-1/2 text-red-light" title="访问热度">
          <ej-icon icon="fire" class="inline-block mr-1"/>
          {{itemData.popularity}}
        </div>
        <div class="text-sm w-1/2 text-blue" title="下载数量">
          <ej-icon icon="download" class="inline-block mr-1"/>
          {{itemData.downloads}}
        </div>
      </div>
    </h4>
    <div class="tracking-wider flex justify-between">
      <span class="item"><span class="text-yellow">{{itemData.category}}</span>大类</span>
      <span class="item"><span class="text-blue">{{itemData.subcategory}}</span>个信息小类</span>
      <span class="item"><span class="text-red">{{itemData.itemAmount}}</span>个信息项目</span>
    </div>
  </div>
</template>

<script>

  import {
    Icon as EjIcon,
  } from '@ej/ui'

  export default {
    name: 'EssentialsStandardItem',

    components: {
      EjIcon,
    },

    props: {
      itemData: Object,
    },
  }
</script>

<style lang="scss" scoped>
  .tab-item {
    &-icon {
      line-height: 1.85;
    }

    &-title {
      @apply tracking-wider text-base float-left text-gray-darkest w-7/12 truncate cursor-pointer; // leading-relaxed

      &:hover {
        @apply font-bold;

        transition: .3s;
      }
    }

    .item {
      @apply text-gray-darker;

      font-size: 12px;
      margin-top: 3px;
    }

    svg {
      width: 14px;
      height: 14px;
    }
  }
</style>
