<template>
  <el-dialog :visible.sync="isVisible"
             width="640px"
             :before-close="handleClose"
             append-to-body
             class="organizations-dialog-version">
    <h3 slot="title">
      {{ title }}
      <span class="info">当前版本：{{ info.version }}</span>
    </h3>
    <div class="organizations-dialog-detail__content" style="padding-top: 0;">
      <div v-for="(item, index) in organizationsList"
          :key="index"
          :class="['item', `is-${item.type}`]">
        <div class="item__label">{{ item.label }}：</div>
        <div class="item__value">{{ item.value }}</div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
  import {
    Dialog as ElDialog,
  } from 'element-ui'

  import {organizationsList} from '~/components/common/version/institutional-dialog/data'

  export default {
    components: {
      ElDialog,
    },
    props: {
      visible: Boolean,
      info: {
        type: Object,
        default: () => { return {} },
      },
    },
    data () {
      return {
        isVisible: false,
        organizationsList,
        busiButtonsObj: {},
      }
    },
    computed: {
      title () {
        return `${this.info.cnName}详情`
      },
    },
    methods: {
      initData () {
        this.organizationsList.forEach(x => {
          x.value = this.info[x.key]
        })
      },
      handleClose (done) {
        done()
        this.$emit('update:visible', false)
      },
      onConfirm () {
        this.$emit('update:visible', false)
      },
    },
    watch: {
      'visible' (newVal) {
        this.isVisible = newVal
        this.initData()
      },
    },
  }
</script>

<style lang="scss">
  .organizations-dialog-version {
    h3 {
      font-size: 14px;
      color: #595959;

      .info {
        @apply inline-block align-baseline;
        margin-left: 20px;
        font-size: 12px;
        line-height: 12px;
        color: #909399;
      }
    }

    &__content {
      @apply flex flex-row flex-wrap;

      .item {
        @apply flex flex-row text-gray-darkest;

        line-height: 22px;
        margin-bottom: 16px;
        font-size: 14px;

        &.is-text {
          flex-basis: 33.33%;
        }

        &.is-textarea {
          flex-basis: 100%;
        }

        &__label {
          @apply text-right;

          width: 70px;
        }

        &__value {
          @apply flex-1 text-gray-darker;

          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          max-width: 120px;
          padding-right: 10px;
          box-sizing: border-box;
        }
      }
    }
  }
</style>
