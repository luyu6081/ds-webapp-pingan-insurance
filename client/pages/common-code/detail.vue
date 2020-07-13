<template>
  <div class="common-code-detail" v-ej-loading.fullscreen="loading">
    <div class="common-code-detail__header">
      <el-breadcrumb separator="/" class="float-left">
        <el-breadcrumb-item>标准内容</el-breadcrumb-item>
        <el-breadcrumb-item :to="{name: 'common-codes'}">公共代码列表</el-breadcrumb-item>
        <el-breadcrumb-item>{{info.cnName}}</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- ,'question' -->
      <busi-buttons v-model="busiButtonsObj"
                    :show-button="['collect', 'watched', 'import']"
                    :disabled="isReadOnly"
                    :operaId="info.id || ''"
                    :title="info.cnName"
                    :type="type"
                    class="inline-block mr-6"
                    @click="onOperate"/>
    </div>
    <div class="common-code-detail__content">
      <div class="detail">
        <h3>
          {{info.cnName}}<span class="sub-title">{{info.enName}}</span>
          <span>最新更新时间：{{ info.modifyTm }} 由 {{info.modifier && info.modifier.name}}更新</span>
        </h3>
        <div class="detail-item-box">
          <div v-for="(item, index) in labelList"
                :key="index"
                :class="['detail-item', `${item.type ? `is-${item.type}`: ''}`]"
                :style="{'flex-basis': `${item.basis}%`}">
                <span class="detail-item__label">{{ item.label }}：</span>
                <span class="detail-item__value">{{ item.value }}</span>
          </div>
        </div>
        <div class="btn-group text-right">
          <el-button type="primary" :disabled="isReadOnly" @click="handleOperate(0)">映射</el-button>
          <el-button type="primary" :disabled="isReadOnly || isAuditing" @click="handleOperate(1)">新建</el-button>
        </div>
        <common-table :list="mappingList" :columns="columns"></common-table>
      </div>
    </div>
    <!-- 弹窗提示 -->
    <dialog-message-box :visible.sync="messageBoxVisible"
                        :info="messageBoxData"></dialog-message-box>
    <!-- 新建编辑编码弹窗 -->
    <dialog-detail-code :visible.sync="detailCodeVisible" :form="detailCodeForm"></dialog-detail-code>
  </div>
</template>

<script>

  import {
    Breadcrumb as ElBreadcrumb,
    BreadcrumbItem as ElBreadcrumbItem,
    Button as ElButton,
  } from 'element-ui'

  import runtimeArgs from '@/runtime-args'

  import QUERY_DS_COMMON_CODE_VALUE from '~/graphql/common-code/ds-common-code-value-query.gql'
  import QUERY_DS_COMMON_CODE_VALUES from '~/graphql/common-code/ds-common-code-values-query.gql'
  import QUERY_DS_COMMON_CODE from '~/graphql/common-code/ds-common-code-query.gql'
  import QUERY_DS_EXPORT_STANDARD from '~/graphql/common/ds-export-standard-query.gql'
  import QUERY_DS_IS_COLLECT_SUBSCRIBE from '~/graphql/common/ds-is-collect-subscribe-query.gql'
  import MUTATION_DS_DEL_COMMON_CODE_VALUE from '~/graphql/common-code/ds-del-common-code-value-mutation.gql'

  import BusiButtons from '~/components/busiButtons'
  import CommonTable from '~/components/common/table'
  import DialogMessageBox from '~/components/common/message-box'
  import DialogDetailCode from '~/components/common-code/dialog-detail-code'

  import MessageBoxMixins from '~/mixins/message-box'
  import CommonVersionMixins from '~/mixins/common-version'
  import {formatDate} from '~/utils/date'
  import {labelList, COLUMNS} from '~/components/common-code/detail/data'

  export default {
    mixins: [
      MessageBoxMixins,
      CommonVersionMixins,
    ],
    components: {
      ElBreadcrumb,
      ElBreadcrumbItem,
      ElButton,
      BusiButtons,
      CommonTable,
      DialogMessageBox,
      DialogDetailCode,
    },
    computed: {
      isAuditing () {
        const {auditStatus} = this.info || {}
        return auditStatus === 'AUDITING'
      },
      loading () {
        return this.loadingCount !== 0
      },
    },
    data () {
      return {
        type: 'CODE',
        id: null,
        info: {},
        busiButtonsObj: {
          isCollect: false,
          isWatched: false,
        },
        labelList,
        mappingList: [],
        columns: [],
        detailCodeVisible: false,
        detailCodeForm: {},
        loadingCount: 0,
        fileUploadUrl: runtimeArgs.NUXT_ENV_FILE_HTTP_ENDPOINT,
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      onDetailCodeVisible (detailCodeForm = {}) {
        this.detailCodeForm = detailCodeForm
        this.detailCodeVisible = true
      },
      handleOperate (code) {
        const {id, info: {cnName}} = this
        switch (code) {
          case 0: // 映射
            this.$router.push({path: 'common-code-detail-map', query: {id, cnName}})
            break
          case 1: // 新建
            this.onDetailCodeVisible()
            break
        }
      },
      init () {
        const {id} = this.$route.query
        this.id = id
        this.getDetailInfo()
        this.getCollectData()
        this.getValueList()
      },
      async onTableHandler (e, row, type) {
        const {id} = row
        switch (type) {
          case 'edit': // 编辑
            this.loadingCount++
            const {data: {data}} = await this.$apollo.query({
              query: QUERY_DS_COMMON_CODE_VALUE,
              fetchPolicy: 'network-only',
              variables: {
                id,
              },
            })
            this.loadingCount--
            const detailCodeForm = data || {}
            this.onDetailCodeVisible(detailCodeForm)
            break
          case 'delete': // 删除
            this.showMessageBox({
              title: '编码项删除提示',
              content: '确定要删除当前编码项吗？',
              confirm: () => {
                this.loadingCount++
                this.$apollo.mutate({
                  mutation: MUTATION_DS_DEL_COMMON_CODE_VALUE,
                  variables: {
                    id,
                  },
                  update: (store, {data: {data}}) => {
                    this.loadingCount--
                    if (data) {
                      this.message()
                      this.getValueList()
                    }
                  },
                }).catch(e => {
                  this.loadingCount--
                })
              },
            })
            break
        }
      },
      async getValueList () {
        this.loadingCount++
        let {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_COMMON_CODE_VALUES,
          fetchPolicy: 'network-only',
          variables: {
            codeId: this.id,
          },
        })
        this.loadingCount--
        this.mappingList = data || []
        this.columns = COLUMNS.bind(this)()
      },
      async getDetailInfo () {
        this.loadingCount++
        let {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_COMMON_CODE,
          fetchPolicy: 'network-only',
          variables: {
            id: this.id,
          },
        })
        this.loadingCount--
        if (data && data.modifyTm) {
          data.modifyTm = formatDate(data.modifyTm)
        }
        this.info = data || {}
        this.labelList.forEach(x => {
          x.value = this.info[x.key]
        })
      },

      async onOperate (command) {
        const {type, id} = this
        switch (command) {
          case 'import': // 下载
            const {data: {data}} = await this.$apollo.query({
              query: QUERY_DS_EXPORT_STANDARD,
              fetchPolicy: 'network-only',
              variables: {
                type,
                ids: [id],
              },
            })
            if (data) {
              window.open(`${this.fileUploadUrl}fileDownload?ambryId=${data}`, '_blank')
            }
            break
        }
      },

      async getCollectData () {
        const {id, type} = this
        this.loadingCount++
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_IS_COLLECT_SUBSCRIBE,
          fetchPolicy: 'network-only',
          variables: {
            id,
            type,
          },
        })
        this.loadingCount--
        const {isCollect, isSubscribe: isWatched} = data
        this.busiButtonsObj = {
          isCollect,
          isWatched,
        }
      },
    },
  }
</script>

<style lang="scss">
  .common-code-detail {
    @apply bg-white flex-1;

    &__header {
      @apply text-gray-darkest;

      line-height: 50px;
      height: 50px;
      background-color: #f4f7fe;
      padding-left: 24px;

      .common-buttons {
        float: right;
        margin-right: 24px;
      }
    }

    &__content {
      padding: 20px 24px 20px 34px;
      box-sizing: border-box;

      .detail {
        h3 {
          @apply relative text-gray-darkest font-bold;

          line-height: 24px;
          height: 24px;
          font-size: 16px;

          &::before {
            @apply absolute bg-blue;

            content: '';
            width: 2px;
            height: 12px;
            left: -10px;
            top: 6px;
          }

          span {
            @apply text-gray-darker font-normal;

            font-size: 12px;

            &.sub-title {
              margin-left: 16px;
              margin-right: 46px;
            }
          }
        }

        &-item-box {
          @apply flex flex-row flex-wrap;
        }

        &-item {
          @apply flex-1 text-gray-darkest flex;

          margin-top: 16px;
          font-size: 14px;
          line-height: 22px;

          &__label,
          &__value {
            @apply inline-block;
          }

          &__label {
            @apply text-right;

            width: 70px;
          }

          &__value {
            @apply flex-1;

            max-width: 130px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
          }

          &.is-textarea {
            .detail-item__value {
              max-width: none;
              white-space: normal;
              word-break: break-all;
            }
          }
        }

        .btn-group {
          margin-top: 20px;
          margin-bottom: 16px;
        }
      }
    }
  }
</style>
