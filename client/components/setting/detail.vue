<template>
  <el-dialog :visible.sync="isVisible"
             :title="title"
             width="550px"
             append-to-body
             :before-close="onHandleClose"
             class="dialog-setting-detail">
    <div class="content">
      <h3>总得分：<span class="score">{{info.score}}分</span></h3>
      <p>排名：第{{ info.ranking }}名（<i v-if="info.changRanking > 0" class="el-icon-top"></i><i v-if="info.changRanking < 0" class="el-icon-bottom"></i>{{Math.abs(info.changRanking)}}名）</p>
      <div class="item">
        <p>落地分：<span class="score">{{ info.completeScore }}分</span></p>
        <p class="tip">累计映射项 共{{ info.mappingNumber }}条 落地映射项，共{{ info.checkCorrectNumber }}条 完成率{{ info.completeRate }}%，得分<span class="score">{{ info.completeScore }}分</span></p>
      </div>
      <div class="item green">
        <p>错误分：<span class="score">{{ info.errorScore }}分</span></p>
        <p class="tip">累计错误条 共{{ info.checkErrorNumber }}条，错误率{{ info.errorRate }}%，得分<span class="score">{{ info.errorScore }}分</span></p>
      </div>
    </div>
  </el-dialog>
</template>

<script>
  import {
    Dialog as ElDialog,
  } from 'element-ui'

  import QUERY_DS_STANDARD_SCORE_ITEM from '~/graphql/setting/ds-standard-score-item-query.gql'

  export default {
    components: {
      ElDialog,
    },
    props: {
      visible: Boolean,
      title: String,
      id: String,
    },
    data () {
      return {
        isVisible: this.visible,
        info: {},
      }
    },
    methods: {
      init () {
        this.load()
      },
      async load () {
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_STANDARD_SCORE_ITEM,
          fetchPolicy: 'network-only',
          variables: {
            id: this.id,
          },
        })
        this.info = data || {}
      },
      onHandleClose (done) {
        if (typeof done === 'function') {
          done()
        }
        this.onCancel()
      },
      onCancel () {
        this.$emit('update:visible', false)
      },
    },
    watch: {
      'visible' (newVal) {
        this.isVisible = newVal
        if (newVal) {
          this.init()
        }
      },
    },
  }
</script>

<style lang="scss">
  .dialog-setting-detail {
    @apply text-left;

    .content {
      padding-top: 5px;
      padding-bottom: 10px;
      box-sizing: border-box;

      h3 {
        font-weight: 500;
        font-size: 18px;
        line-height: 25px;
        color: #595959;
        margin-bottom: 20px;
      }

      .score {
        color: #faad14;
      }
    }

    .el-icon-top {
      color: #50c51a;
    }

    .el-icon-bottom {
      color: #ff6a6a;
    }

    p {
      font-size: 14px;
      line-height: 20px;

      &.tip {
        font-size: 12px;
        line-height: 22px;
        margin-top: 8px;
      }
    }

    .item {
      margin-top: 16px;

      &.green {
        .score {
          color: #50c51a
        }
      }
    }
  }
</style>
