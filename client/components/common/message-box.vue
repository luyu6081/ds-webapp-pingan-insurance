<template>
  <el-dialog  :visible.sync="isVisible"
              width="438px"
              :before-close="onHandleClose"
              append-to-body
              class="common-message-box">
    <div class="common-message-box__content">
      <!-- exclamation-circle -->
      <!-- question-circle -->
      <div class="title"><ej-icon icon="question-circle"></ej-icon>{{ info.title || '提示'}}</div>
      <div class="content">{{ info.content }}</div>
    </div>
    <div slot="footer">
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import {
    Button as ElButton,
    Dialog as ElDialog,
  } from 'element-ui'

  import {
    Icon as EjIcon,
  } from '@ej/ui'

  export default {
    components: {
      ElButton,
      ElDialog,
      EjIcon,
    },
    props: {
      visible: Boolean,
      info: Object,
    },
    data () {
      return {
        isVisible: this.visible,
      }
    },
    methods: {
      onCancel () {
        this.$emit('update:visible', false)
        this.info.cancel()
      },
      onConfirm () {
        this.$emit('update:visible', false)
        this.info.confirm()
      },
      onHandleClose (done) {
        this.onCancel()
        if (typeof done === 'function') {
          done()
        }
      },
    },
    watch: {
      visible (newVal) {
        this.isVisible = newVal
      },
    },
  }
</script>

<style lang="scss">
  .common-message-box {
    .el-dialog__header {
      display: none;
    }

    .el-dialog__body {
      padding: 34px 29px 10px 39px;

      .ej-icon {
        @apply inline-block;

        color: #FAAD14;
        margin-right: 20px;
      }

      .title {
        color: #000;
        font-size: 16px;
        font-weight: bold;
        line-height: 24px;
        margin-bottom: 20px;
      }

      .content {
        font-size: 14px;
        line-height: 22px;
        color: #5a5a5a;
        padding-left: 44px;
      }
    }

    .el-dialog__footer {
      border-top: none;
    }

    &__content {}
  }
</style>
