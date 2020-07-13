<template>
  <div class="tab-item">
    <h4 class="clearfix">
      <p class="tab-item-title">
        <router-link :to="{name: standardRoute[itemData.type], query:{id: itemData.id}}">{{itemData.name}}</router-link>
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
    <p class="truncate tracking-wider pt-1 text-gray-darker">{{itemData.description}}</p>
  </div>
</template>

<script>

  import {
    Icon as EjIcon,
  } from '@ej/ui'

  export default {
    name: 'NewStandardItem',

    components: {
      EjIcon,
    },

    props: {
      itemData: Object,
    },

    data () {
      return {
        standardRoute: {
          STANDARD: 'essentials',
          CODE: 'common-code-detail',
          STATISTICS: 'stat-specs',
          INSTITUTIONAL: 'organizations',
        },
      }
    },
  }
</script>

<style lang="scss" scoped>
  .tab-item {
    &-icon {
      line-height: 1.85;
    }

    &-title {
      @apply  tracking-wider float-left text-base text-black w-7/12 truncate cursor-pointer; // leading-relaxed

      &:hover {
        @apply font-bold;

        transition: .3s;
      }
    }

    .tracking-wider {
      font-size: 12px;
    }

    svg {
      width: 14px;
      height: 14px;
    }
  }
</style>
