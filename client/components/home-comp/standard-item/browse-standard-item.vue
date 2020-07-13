<template>
  <div class="tab-item">
    <h4 class="clearfix">
      <div class="tab-item-title">
        <p class="truncate cursor-pointer text-base mr-4 text-gray-darkest">
          <router-link :to="{name: standardRoute[itemData.standardType], query:{id: itemData.id }}">{{itemData.name}}</router-link>
        </p>
        <span class="tab-item-type">{{DsStandardType[itemData.standardType]}}</span>
      </div>
      <div class="float-right flex w-3/12 tab-item-icon">
        <div class="text-sm mr-2 text-red-light" title="访问热度">
          <ej-icon icon="fire" class="inline-block mr-1"/>
          {{itemData.popularity}}
        </div>
      </div>
    </h4>
    <p class="truncate pt-1 tracking-wider text-gray-darker">{{itemData.description}}</p>
  </div>
</template>

<script>

  import {
    Icon as EjIcon,
  } from '@ej/ui'

  import {DsStandardType} from '~/components/standard-audit/list-panel-data'

  export default {
    name: 'BrowseStandardItem',

    components: {
      EjIcon,
    },

    props: {
      itemData: Object,
    },

    data () {
      return {
        DsStandardType,
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

    &-type {
      @apply  text-sm text-blue bg-white px-1 rounded border border-blue;

      padding: 0 3px;
      line-height: 19px;
      height: 21px;
    }

    &-title {
      @apply tracking-wider float-left w-9/12 flex;
      &:hover {
        p {
        @apply font-bold;

          transition: .3s;
        }
      }

      p {
        max-width: 160px;
      }
    }

    svg {
      width: 14px;
      height: 14px;
    }
  }
</style>
