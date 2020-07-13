<template>
  <div class="scoring-system" v-ej-loading.fullscreen="loading">
    <div class="scoring-system__header">
      <h3>数据标准评分体系库</h3>
      <p class="info">注：100分（数据标准分）=50分（落地分）+50分（错误分）</p>
      <el-button type="primary" :disabled="isEdit" @click="onSetEdit">设置</el-button>
    </div>
    <no-data v-if="!info && !isEdit"></no-data>
    <div v-else class="scoring-system__content">
      <setting-card ref="card" :info="info" :isEdit="isEdit"></setting-card>
    </div>
    <div class="scoring-system__footer" v-show="isEdit">
      <el-button @click="onOperate('cancel')">取消</el-button>
      <el-button type="primary"  @click="onOperate('save')">保存</el-button>
    </div>

     <!-- 弹窗提示 -->
    <dialog-message-box :visible.sync="messageBoxVisible"
                        :info="messageBoxData"></dialog-message-box>
  </div>
</template>

<script>
  import {
    Button as ElButton,
  } from 'element-ui'

  import DialogMessageBox from '~/components/common/message-box'
  import NoData from '~/components/common/no-data'
  import SettingCard from '~/components/setting/card'

  import MessageBoxMixins from '~/mixins/message-box'

  import QUERY_DS_SCORE_SETTING from '~/graphql/setting/ds-score-setting-query.gql'
  import MUTATION_DS_SAVE_SCORE_SETTING from '~/graphql/setting/ds-save-score-setting-mutation.gql'

  export default {
    name: 'scoring-system',
    mixins: [MessageBoxMixins],

    components: {
      DialogMessageBox,
      SettingCard,
      NoData,
      ElButton,
    },

    computed: {
      loading () {
        return this.loadingCount !== 0
      },
    },
    data () {
      return {
        info: {},
        isEdit: false,
        loadingCount: 0,
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      onOperate (type) {
        switch (type) {
          case 'cancel': // 取消
            this.showMessageBox({
              title: '评分体系库提示',
              content: '确定要取消编辑吗？',
              confirm: () => {
                this.isEdit = false
                const $form = this.$refs['card'].$refs['form']
                Promise
                  .all($form.map(x => x.resetFields()))
                  .then(res => {
                    this.init()
                  })
              },
            })
            break
          case 'save': // 保存
            const $form = this.$refs['card'].$refs['form']
            Promise
              .all($form.map(x => x.validate()))
              .then(res => {
                const cardLlist = this.$refs['card'].cardList
                let _completeScoreSettings = cardLlist[0].list
                let _errorScoreSettings = cardLlist[1].list
                const completeScoreSettings = []
                const errorScoreSettings = []
                _completeScoreSettings.forEach(x => {
                  const {startProportion, endProportion, score} = x
                  completeScoreSettings.push({startProportion, endProportion, score})
                })
                _errorScoreSettings.forEach(x => {
                  const {startProportion, endProportion, score} = x
                  errorScoreSettings.push({startProportion, endProportion, score})
                })
                const input = {
                  completeScoreSettings,
                  errorScoreSettings,
                }
                this.loadingCount++
                this.$apollo.mutate({
                  mutation: MUTATION_DS_SAVE_SCORE_SETTING,
                  variables: {
                    input,
                  },
                  update: (store, {data: {data}}) => {
                    this.loadingCount--
                    if (data) {
                      this.$message.success('保存成功')
                      this.isEdit = false
                      this.init()
                    }
                  },
                }).catch(e => {
                  this.loadingCount--
                })
              })
              .catch(err => {
                console.error(err, 'err')
              })
            break
        }
      },
      onSetEdit () {
        this.isEdit = true
        if (this.info === null) {
          this.info = {}
        }
      },
      async init () {
        this.loadingCount++
        let {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_SCORE_SETTING,
          fetchPolicy: 'network-only',
        })
        this.loadingCount--
        data = data || {}
        this.info = JSON.parse(JSON.stringify(data))
      },
    },
  }
</script>

<style lang="scss">
  .scoring-system {
    box-sizing: border-box;
    padding: 18px 25px;

    &__header {
      @apply text-gray-darkest relative;

      font-size: 16px;
      line-height: 24px;
      margin-bottom: 4px;

      .el-button {
        @apply absolute right-0;

        top: -4px;
      }
    }

    &__content {
      margin-top: 20px;
    }

    .info {
      @apply text-gray-dark;

      font-size: 12px;
      line-height: 20px;
    }

    .no-data {
      background-color: transparent;
    }

    &__footer {
      @apply text-center;

      margin-top: 100px;

      .el-button {
        margin: 0;

        &:nth-of-type(1) {
          margin-right: 20px;
        }
      }
    }
  }
</style>
