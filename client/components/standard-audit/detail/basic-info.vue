<template>
  <!-- 基本信息 -->
  <standard-audit-card class="audit-history">
    <div v-for="(card, index) in info"
         :key="index"
         class="audit-history__item">
      <div class="audit-history__title">{{ card.title }}</div>
      <!-- 标准项详情 -->
      <template v-for="(item, index) in card.list">
        <div class="audit-history-card" :key="index">
          <a class="link" v-if="item.link" :href="item.link"><ej-icon icon="file"></ej-icon>{{ item.label }}</a>
          <template v-else>
            <div v-if="item.label" class="audit-history-card__title">{{ item.label}}</div>
            <template v-for="(subList, lindex) in item.list">
              <essentials-detail-card :list="subList" :key="lindex" ></essentials-detail-card>
            </template>
          </template>
        </div>
      </template>
    </div>
  </standard-audit-card>
</template>

<script>
  import {
    Icon as EjIcon,
  } from '@ej/ui'

  import StandardAuditCard from '~/components/standard-audit/card'
  import EssentialsDetailCard from '~/components/essentials/detail-card'

  export default {
    props: {
      info: Array,
    },
    components: {
      StandardAuditCard,
      EssentialsDetailCard,
      EjIcon,
    },
  }
</script>

<style lang="scss">
  .audit-history {
    &__title {
      @apply relative;

      font-weight: bold;
      line-height: 22px;
      font-size:  16px;
      padding-left: 8px;

      &::before {
        @apply inline-block bg-blue align-middle absolute;

        width: 2px;
        height: 12px;
        content: '';
        margin-right: 8px;
        top: 5px;
        left: 0;
      }
    }

    &__item {
      &:nth-of-type(2) {
        .detail-card-item__text {
          .content {
            color: #595959;
          }
        }
      }

      &:last-of-type {
        .essentials-detail-card {
          margin-bottom: 0;
        }
      }
    }

    &-card {
      &:nth-of-type(3) {
        .audit-history-card__title {
          margin-top: 16px;
        }

        .essentials-detail-card {
          border-bottom: 1px solid #e4e4e4;
          padding-bottom: 12px;
          padding-top: 12px;

          &:nth-of-type(2) {
            padding-top: 0;
          }

          &:last-of-type {
            padding-bottom: 0;
            border-bottom: none;
          }
        }
      }

      &__title {
        @apply text-gray-darkest font-bold;

        padding-left: 8px;
        font-size: 14px;
        line-height: 22px;
        margin: 12px 0 4px;
      }

      a.link {
        @apply text-blue inline-block;

        margin: 10px;

        .ej-icon {
          @apply inline-block;

          width: 12px;
          height: 12px;
          margin-right: 10px;
        }
      }
    }

    .essentials-detail-card {
      @apply flex flex-row flex-wrap;

      margin-bottom: 16px;

      [class^=detail-card-item__] {
        margin-right: 0;
        padding-right: 4px;
        flex-basis: 25%;
      }
      .detail-card-item__textarea {
        @apply flex;

        flex-basis: 100%;
      }
    }

    [class^=detail-card-item__] {
      margin-bottom: 4px;
      margin-top: 4px;

      .content {
        @apply text-left flex-1;

        width: 160px;
      }

      &.is-active {
        span {
          color: #FF133A !important;
        }
      }
    }
  }
</style>
