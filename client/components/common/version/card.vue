<template>
  <div :class="['common-version-card', bg]">
    <h3>{{ info.cnName }}
      <span class="info">{{ info.enName }}</span>
      <span class="info">当前版本：{{ info.version}}</span>
    </h3>
    <div class="common-version-card__list">
      <span v-for="(item, index) in info.list"
            :key="index"
            :class="['list-item', item.type || 'text', item.key]"
            :style="{'flex-basis': `${item.basis}%`}">
        <span class="label">{{ item.label }}：</span>
        <span class="value">{{ item.value }}</span>
      </span>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      info: {
        type: Object,
        default: () => { return {} },
      },
      bg: {
        type: String,
        default: 'bg-white',
      },
    },
  }
</script>

<style lang="scss">
  .common-version-card {
    padding: 16px 24px 16px 32px;
    box-sizing: border-box;
    margin: 20px 0;

    &.essentials {
      background-color: #E5EDFC;

      .list-item {
        @apply text-gray-darker;

        line-height: 28px;
        font-size: 12px;

        &.text,
        &.textarea {
          @apply flex-none;
        }

        &.text {
          @apply inline-block;

          margin-right: 50px;
        }

        &.textarea {
          @apply block;

          width: 100%;

          .label,
          .value {
            @apply align-top;
          }

          .value {
            width: calc(100% - 40px);
          }
        }
      }
    }

    h3 {
      @apply text-gray-darkest relative;

      font-size: 16px;
      font-weight: 600;
      line-height: 24px;
      margin-bottom: 8px;

      &::before {
        @apply absolute left-0 bg-blue;

        width: 2px;
        height: 12px;
        content: '';
        left: -8px;
        top: 6px;
      }

      .info {
        font-weight: normal;

        &:first-of-type {
          margin-left: 10px;
          margin-right: 40px;
        }
      }
    }

    .info {
      @apply inline-block text-gray-darker align-bottom;

      font-size: 12px;
      line-height: 20px;
    }

    &__list {
      @apply flex flex-wrap flex-row;

      .list-item {
        @apply flex-1 flex flex-grow-0 flex-shrink-0 text-gray-darkest;

        font-size: 14px;
        line-height: 38px;

        &.text {
          .value {
            max-width: 250px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
          }
        }

        &.unit {
          .value {
            max-width: 450px;
          }
        }

        &.textarea {

          .value {
            word-break: break-all;
          }
        }

        .label {}

        .value {
          @apply flex-1;
        }

        .label,
        .value {
          @apply inline-block align-middle;
        }
      }
    }
  }
</style>
