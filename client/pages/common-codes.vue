<template>
  <div class="common-codes-view">
    <spec-layout key="common-codes" fixedLayout loadMore @search="handleSearch" @load-more="handleScroll">
      <template #searchRightArea>
        <div class="operate-panel">
          <div class="operate-panel__row">
            <el-button type="text" @click="handleOperate(null, 'export')"><ej-icon icon="export"></ej-icon>上传</el-button>
            <el-button type="text" @click="handleOperate(null, 'import')" :disabled="downloading"><ej-icon icon="import"></ej-icon>下载</el-button>
          </div>
          <div class="operate-panel__row">
            <el-button @click="handleOperate(null, 'stop')">停用</el-button>
            <el-button type="primary" @click="handleOperate(null, 'new')">新增</el-button>
            <!-- <el-button type="primary" @click="handleOperate(null, 'mapping')">映射</el-button> -->
          </div>
        </div>
      </template>
      <template #downArea>
        <el-table :data="commonCode" class="mt-6" style="width: 100%"
                  @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column label="编号" prop="number" width="200"/>
          <el-table-column label="中文名称" prop="cnName"/>
          <el-table-column label="英文名称" prop="enName"/>
          <el-table-column label="映射信息" width="100" show-overflow-tooltip>
            <template #default="scope">
              <div>
                <!-- this.$router.push({path: 'common-code-detail-map', query: {id, cnName}}) -->
                <router-link v-if="scope.row.systemCount" :to="{path: 'common-code-detail-map', query: {id: scope.row.id, cnName: scope.row.cnName}}">
                  <span class="text-blue">{{scope.row.systemCount}}</span>
                </router-link>
                <span v-else>{{scope.row.systemCount}}</span>
                <!-- <span>{{scope.row.systemCount}}</span> -->
              </div>
            </template>
          </el-table-column>
           <el-table-column label="审核状态">
            <template #default="props">
              <audit-status-label :audit-status="props.row.auditStatus"></audit-status-label>
            </template>
          </el-table-column>
          <el-table-column label="使用状态">
            <template #default="props">
              <status-icon :status="props.row.status"></status-icon>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="320" align="center">
            <template #default="scope">
              <el-button v-for="item in scope.row.operateList"
                         :key="item.key"
                         :disabled="item.disabled"
                         type="text"
                         @click="handleOperate(scope.row, item.key)">{{ item.label }}</el-button>
            </template>
          </el-table-column>
          <div slot="append" class="pt-4 text-center h-16">
            <p v-ej-loading="isLoading" :class="{'pt-8' : isLoading}"></p>
            <p v-if="noMore" class="text-gray text-center">没有更多了</p>
          </div>
        </el-table>
      </template>
    </spec-layout>
    <el-backtop class="z-50" :bottom="20"><i class="el-icon-thumb"></i></el-backtop>

    <!-- 消息 -->
    <dialog-message-box :visible.sync="messageBoxVisible" :info="messageBoxData"></dialog-message-box>

    <!-- 公共代码编辑弹窗 -->
    <dialog-edit-form :visible.sync="editVisible" :form="editForm"></dialog-edit-form>
    <!-- 文件上传 -->
    <dialog-file-upload :visible.sync="fileUploadVisible"></dialog-file-upload>
  </div>
</template>

<script>

  import {
    Backtop as ElBacktop,
    Button as ElButton,
    Table as ElTable,
    TableColumn as ElTableColumn,
  } from 'element-ui'

  import {
    Icon as EjIcon,
  } from '@ej/ui'

  import runtimeArgs from '@/runtime-args'

  import QUERY_DS_COMMON_CODES from '~/graphql/common-code/ds-common-codes-query.gql'
  import QUERY_DS_COMMON_CODE from '~/graphql/common-code/ds-common-code-query.gql'
  import MUTATION_DS_ENABLE_COMMON_CODE from '~/graphql/common-code/ds-enable-common-code-mutation.gql'
  import MUTATION_DS_ENABLE_COMMON_CODES from '~/graphql/common-code/ds-enable-common-codes-mutation.gql'
  import MUTATION_DS_DEL_COMMON_CODE from '~/graphql/common-code/ds-del-common-code-mutation.gql'
  import MUTATION_DS_SUBMIT_AUDIT from '~/graphql/audit/ds-submit-audit-mutation.gql'
  import MUTATION_DS_SUBMIT_AUDITS from '~/graphql/audit/ds-submit-audits-mutation.gql'

  import QUERY_DS_EXPORT_STANDARD from '~/graphql/common/ds-export-standard-query.gql'

  import SpecLayout from '~/components/spec-layout'
  // import DownloadComp from '~/components/download'
  import AuditStatusLabel from '~/components/common/audit-status-label'
  import StatusIcon from '~/components/common/status-icon'
  import DialogMessageBox from '~/components/common/message-box'
  import DialogEditForm from '~/components/common-code/dialog-edit'
  import DialogFileUpload from '~/components/stat-specs/dialog-upload'

  import MessageBoxMixins from '~/mixins/message-box'

  export default {
    name: 'CommonCodesView',
    mixins: [MessageBoxMixins],

    components: {
      ElBacktop,
      ElButton,
      ElTable,
      ElTableColumn,
      SpecLayout,
      // DownloadComp,
      AuditStatusLabel,
      StatusIcon,
      DialogMessageBox,
      DialogEditForm,
      DialogFileUpload,
      EjIcon,
    },

    data () {
      return {
        type: 'CODE',
        commonCode: [],
        fileUploadVisible: false,

        isLoading: false,
        noMore: false,

        isLock: false,

        keyWord: '',

        offset: 0,
        limit: 20,

        keepAliveTime: 0, // 记录访问该组件的时间点

        operateList: [
          {key: 'detail', label: '查看', disabled: false},
          {key: 'mapping', label: '映射', disabled: false},
          {key: 'edit', label: '编辑', disabled: false},
          {key: 'del', label: '删除', disabled: false},
          {key: 'stop-row', label: '停用', disabled: false},
          {key: 'run', label: '启用', disabled: false},
          {key: 'version', label: '版本历史', disabled: false},
        ],

        editVisible: false,
        editForm: {},
        detailVisible: false,
        selTableItems: [],
        downloading: false,
        fileUploadUrl: runtimeArgs.NUXT_ENV_FILE_HTTP_ENDPOINT,
      }
    },

    created () {
      this.sendCommonCodeData({offset: this.offset, limit: this.limit, keyWord: this.keyWord})
    },

    /**
     * 进该组件时，根据路由来向，判断该组件是否被缓存
     */
    beforeRouteEnter (to, from, next) {
      const froms = ['common-code', 'sys-mapping']
      if (to.name === 'common-codes' && froms.includes(from.name)) {
        to.meta.keepAlive = true
      } else {
        to.meta.keepAlive = false
      }
      next()
    },

    /**
     * keep-alive 激活钩子
     */
    activated () {
      const ONE_HOUR_IN_MS = 1000 * 60 * 60 // 1小时
      let currentTime = new Date().getTime()

      if (this.keepAliveTime && (currentTime - this.keepAliveTime) >= ONE_HOUR_IN_MS) { // 返回该页面时间超出1个小时，重新请求数据
        this.commonCode = [] // 清空数据
        this.sendCommonCodeData({offset: this.offset, limit: this.limit, keyWord: this.keyWord}) // 重新请求数据
        this.$route.meta.keepAlive = false
        this.keepAliveTime = currentTime
      } else { // 第一次访问该组件 或 返回该页面时间1小时内，设置 或 重置缓存时间为当前时间
        this.keepAliveTime = currentTime
      }
    },

    methods: {
      handleSelectionChange (val) {
        this.selTableItems = val
      },
      async getDetail (id) {
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_COMMON_CODE,
          fetchPolicy: 'network-only',
          variables: {
            id,
          },
        })
        this.editForm = data || {}
      },
      async showDialogEdit (id, type) {
        if (type === 'new') { // 新建
          this.editForm = {}
        } else if (type === 'edit') { // 编辑
          await this.getDetail(id)
        }
        this.editVisible = true
      },
      async handleOperate (row, type) {
        const enableParams = {}
        const {id, cnName, auditStatus, standardId} = row || {}
        if ((type === 'import' || type === 'stop') && this.selTableItems.length === 0) {
          const obj = {
            import: '下载',
            stop: '停用',
          }
          let info = `请先选择需要${obj[type]}的数据！`
          this.$message.error(info)
          return
        }
        if (type === 'stop') {
          const deactivatedCount = this.selTableItems.filter(x => x.status === 'DEACTIVATE').length
          if (deactivatedCount > 0) {
            this.$message.error(`当前已选数据中，已包含${deactivatedCount}条禁用数据！`)
            return
          }
        }
        if (['stop-row', 'stop', 'run'].includes(type)) {
          const enableObj = {
            'stop-row': 'DEACTIVATE',
            'stop': 'DEACTIVATE',
            'run': 'ENABLE',
          }
          if (type === 'stop') {
            enableParams.ids = this.selTableItems.map(x => x.id)
          } else {
            enableParams.id = id
          }
          enableParams.status = enableObj[type]
        }
        switch (type) {
          case 'export': // 上传
            this.fileUploadVisible = true
            break
          case 'import': // 下载
            this.downloading = true
            this.$message.success('文件努力下载中...')
            const {data: {data}} = await this.$apollo.query({
              query: QUERY_DS_EXPORT_STANDARD,
              fetchPolicy: 'network-only',
              variables: {
                type: this.type,
                ids: this.selTableItems.map(x => x.id),
              },
            })
            this.downloading = false
            if (data) {
              window.open(`${this.fileUploadUrl}fileDownload?ambryId=${data}`, '_blank')
            }
            break
          case 'stop': // 停用
            this.enableRowsStatus(enableParams)
            break
          case 'detail': // 查看
            this.$router.push({path: '/common-code-detail', query: {id}})
            break
          case 'mapping': // 映射
            this.$router.push({path: 'common-code-detail-map', query: {id, cnName}})
            break
          case 'new': // 新增
          case 'edit': // 编辑
            this.showDialogEdit(id, type)
            break
          case 'del': // 删除
            this.showMessageBox({
              content: '确认要删除该条数据吗？',
              confirm: () => {
                this.delRowItem(id, cnName, auditStatus)
              },
            })
            break
          case 'stop-row': // 停用
          case 'run': // 启用
            this.enableRowStatus(enableParams, cnName)
            break
          case 'version': // 版本历史
            this.$router.push({name: 'common-version', params: {id: standardId, type: this.type}})
            break
        }
      },
      // 提交审核 params = {title, type, id, operation}
      onSubmitAudit (params, {cb, cbParams}) {
        this.$apollo.mutate({
          mutation: MUTATION_DS_SUBMIT_AUDIT,
          variables: {
            ...params,
          },
          update: (store, {data: {data}}) => {
            if (data) {
              const {operation} = params
              if (operation === 'DEL') {
                this.message({message: '删除成功！', type: 'success'})
              } else {
                this.message()
              }
              if (typeof cb === 'function') {
                cb(cbParams)
              }
            }
          },
        })
      },
      // 提交审核 params = {type, ids, operation}
      onSubmitAudits (params, {cb, cbParams}) {
        this.$apollo.mutate({
          mutation: MUTATION_DS_SUBMIT_AUDITS,
          variables: {
            ...params,
          },
          update: (store, {data: {data}}) => {
            if (data) {
              const {operation} = params
              if (operation === 'DEL') {
                this.message({message: '删除成功！', type: 'success'})
              } else {
                this.message()
              }
              if (typeof cb === 'function') {
                cb(cbParams)
              }
            }
          },
        })
      },
      delRowItem (id, cnName, auditStatus) {
        this.$apollo.mutate({
          mutation: MUTATION_DS_DEL_COMMON_CODE,
          variables: {
            id,
          },
          update: (store, {data: {data}}) => {
            if (data) {
              // 提交审核
              if (auditStatus !== 'UNAUDITED') { // 非草稿
                // 提交审核
                this.onSubmitAudit({
                  title: cnName,
                  id,
                  type: this.type,
                  operation: 'DEL',
                }, {cb: this.handleSearch, cbParams: this.keyWord})
              } else {
                this.message({message: '删除成功！', type: 'success'})
                this.handleSearch(this.keyWord)
              }
            }
          },
        })
      },
      enableRowsStatus (enableParams, cnName) {
        this.$apollo.mutate({
          mutation: MUTATION_DS_ENABLE_COMMON_CODES,
          variables: {
            ...enableParams,
          },
          update: (store, {data: {data}}) => {
            if (data) {
              // 提交审核
              this.onSubmitAudits({
                ids: enableParams.ids,
                type: this.type,
                operation: 'UPDATE',
              }, {cb: this.handleSearch, cbParams: this.keyWord})
            }
          },
        })
      },
      enableRowStatus (enableParams, cnName) {
        this.$apollo.mutate({
          mutation: MUTATION_DS_ENABLE_COMMON_CODE,
          variables: {
            ...enableParams,
          },
          update: (store, {data: {data}}) => {
            if (data) {
              // 提交审核
              this.onSubmitAudit({
                title: cnName,
                id: enableParams.id,
                type: this.type,
                operation: 'UPDATE',
              }, {cb: this.handleSearch, cbParams: this.keyWord})
            }
          },
        })
      },
      /**
       * 发送请求 获取公共代码列表数据
       */
      async sendCommonCodeData (options) {
        if (this.isLoading) {
          return
        }

        this.isLoading = true
        this.noMore = false

        const {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_COMMON_CODES,
          fetchPolicy: 'network-only',
          variables: {
            input: {...options},
          },
        })

        this.isLoading = false
        let {total, limit, dsCommonCodeInfos} = data
        dsCommonCodeInfos = dsCommonCodeInfos || []
        this.limit = limit
        this.total = total

        if (dsCommonCodeInfos.length) {
          const disabledList = ['edit', 'del', 'stop-row', 'run']
          const staObj = {
            ENABLE: 'run',
            DEACTIVATE: 'stop-row',
          }
          dsCommonCodeInfos.forEach(x => {
            const listCopy = JSON.parse(JSON.stringify(this.operateList))
            const index = listCopy.findIndex(l => l.key === staObj[x.status])
            if (index > -1) {
              listCopy.splice(index, 1)
            }
            listCopy.forEach(o => {
              if (x.auditStatus === 'AUDITING') {
                o.disabled = disabledList.includes(o.key)
              }
            })
            x.operateList = listCopy
          })
          this.commonCode = this.commonCode.concat(dsCommonCodeInfos)
          this.offset = this.offset + this.limit
        } else {
          if (this.commonCode.length > 0) {
            this.noMore = true
          }
          this.isLock = true
        }
      },

      handleSearch (arg) {
        this.keyWord = arg

        this.offset = 0

        this.commonCode = []

        this.sendCommonCodeData({offset: this.offset, limit: this.limit, keyWord: this.keyWord})
      },

      /**
       * 下拉滚动加载
       */
      handleScroll () {
        if (this.isLock) {
          // 2秒钟后释放锁
          setTimeout(() => { this.isLock = false }, 2000)
        }
        if (!this.isLock) {
          this.sendCommonCodeData({offset: this.offset, limit: this.limit})
        }
      },

      handleDownload (id) {
        console.log('下载', id)
      },
    },
  }
</script>

<style lang="scss">
  .common-codes-view {
    @apply flex-1;

    .el-button {
      @apply text-blue;
    }

    .el-table {
      margin-top: 90px;

      .el-button {
        @apply relative;

        outline: none !important;
        padding: 5px;
        margin: 0 !important;

        &:last-of-type {
          &::after {
            display: none;
          }
        }

        &::after {
          @apply absolute bg-blue;

          content: '';
          right: -1px;
          width: 1px;
          height: 14px;
        }
      }
    }

    .el-table td, .el-table th {
      padding: 10px 0;
    }

    .el-table__header-wrapper {
      @apply fixed z-20;
    }

    .el-table__body-wrapper {
      margin-top: 44px;
    }

    .el-table__header-wrapper tr th {
      @apply text-black;
    }

    .el-table__expand-icon {
      display: none;
    }

    .el-table td.el-table__expand-column {
      padding: 0
    }

    .el-button {
      outline: none !important;
    }

    .operate-panel {
      .ej-icon {
        @apply text-blue inline-block;

        width: 12px;
        height: 12px;
        margin: 0 10px 0 0;
      }

      &__row {
        @apply text-right;

        margin: 5px 0 16px;

        &:last-of-type {
          margin-bottom: 0;
        }

        .el-button {

          &--text {

            * {
              outline: none;
            }

            &:not(.is-disabled) {
              @apply text-gray-darkest;
            }

            padding: 0;

            &:last-of-type {
              margin-left: 20px;
            }
          }
        }
      }
    }
  }
</style>
