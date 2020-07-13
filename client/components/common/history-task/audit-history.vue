<template>
  <div class="audit-history-view">
    <div v-for="(item, index) in options" :key="index" class="flex align-center audit-history-view__list">
      <div class="audit-history-view__user flex items-center">
        <img v-if="item.img" :src="item.img" class="photo">
        <img v-else class="photo" src="~/assets/user.svg"/>
        <div class="base flex flex-col justify-center">
          <span>{{item.title}}</span>
          <span class="text-gray-dark">{{item.name}}</span>
        </div>
      </div>
      <div class="audit-history-view__info">
        <p>
          <span>审批时间<span class="text-blue pl-xs">{{item.timestamp | formatDate}}</span></span>
          <span>历时约<span class="text-blue pl-xs">{{item.duration | humanizeTime}}</span></span>
          <span v-if="attachmentLen(item) !== 0">{{ `有${attachmentLen(item)}附件`}}</span>
          <!-- <span v-else class="tip">暂无附件</span> -->
        </p>
        <p>审批意见：
          <slot name="attachment" :options="item.attachment" :content="item.content" />
        </p>
      </div>
    </div>
  </div>
</template>

<script>
  import {formatDate, humanizeTime} from '~/utils/date'
  export default {
    name: 'AuditHistory',

    filters: {
      humanizeTime,
      formatDate,
    },

    props: {
      options: {
        type: Array,
        default: () => [],
      },
    },

    methods: {
      attachmentLen (item) {
        return item.attachment ? item.attachment.length : 0
      },
    },
  }
</script>

<style lang="scss">
  .audit-history-view {
    padding: 20px;
    font-size: 12px;

    &__list {
      line-height: 20px;
      padding-bottom: 40px;
      position: relative;
      overflow: hidden;

      &::after {
        content: '';
        position: absolute;
        left: 17.45px;
        top: 30px;
        width: 1px;
        height: 100%;
        /*background: theme('colors.blue.default');*/
      }

      &:last-child {
        padding-bottom: 0;

        &::after {
          display: none;
        }
      }
    }

    &__user {
      width: 200px;

      .photo {
        width: 36px;
        height: 36px;
        margin-right: 11px;
      }

      .base {
        height: 36px;
        font-size: 14px;
        line-height: 20px;

        .text-gray-dark {
          font-size: 12px;
        }
      }
    }

    &__info {
      p {
        margin-bottom: 8px;

        &:last-of-type {
          margin-bottom: 0;
        }

        .tip {
          color: #909399;
        }
      }

      span {
        margin-right: 20px;
        font-size: 14px;
      }
    }
  }
</style>
