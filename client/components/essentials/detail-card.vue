<template>
  <div class="essentials-detail-card">
    <div v-for="(item, index) in list"
         :key="index"
         :class="[`detail-card-item__${item.type}`, {'is-active': item.contentActive}]">
      <span class="label">{{ item.label }}：</span>

      <template v-if="item.type !== 'radio'">
        <span class="content">{{ item.value }}</span>
      </template>

      <template v-if="item.type === 'radio'">
        <el-radio-group v-model="item.value" disabled>
          <el-radio v-for="item in item.labels"
                    :key="item.value"
                    :label="item.value">{{ item.label }}</el-radio>
        </el-radio-group>
      </template>
    </div>
  </div>
</template>

<script>
  import {
    Radio as ElRadio,
    RadioGroup as ElRadioGroup,
  } from 'element-ui'

  export default {
    components: {
      ElRadio,
      ElRadioGroup,
    },
    props: {
      list: Array,
    },
  }
</script>

<style lang="scss">
  .essentials-detail-card {
    @apply flex flex-row flex-wrap;

    span {
      @apply inline-block text-gray-darkest align-middle;

      line-height: 24px;
    }

    [class^=detail-card-item__] {
      @apply flex flex-row;

      box-sizing: border-box;
      flex-basis: 33.33%;
      padding-right: 10px;
      margin-bottom: 8px;

      &.is-active {
        .content {
          @apply text-blue;
        }
      }
    }

    .detail-card-item {
      &__textarea {
        flex-basis: 100%;
        margin-bottom: 8px;

        .content {
          @apply align-top;

          text-overflow: inherit;
          white-space: normal;
          word-break: break-all;
        }
      }
    }

    .label {
      @apply text-right;

      width: 130px;
    }

    .content {
      @apply text-gray-dark flex-1;

      width: 100px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
  }
</style>
