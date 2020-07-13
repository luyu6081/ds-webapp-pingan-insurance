<template>
  <div class="stat-specs-view">
    <spec-layout key="stat-specs" fixed-layout load-more @search="handleSearch" @load-more="handleScroll">
      <template #searchRightArea>
        <div class="operate-panel">
          <div class="operate-panel__row">
            <el-button type="text" @click="handleOperate(null, 'export')"><ej-icon icon="export"></ej-icon>上传</el-button>
            <el-button type="text" @click="handleOperate(null, 'import')" :disabled="downloading"><ej-icon icon="import"></ej-icon>下载</el-button>
          </div>
          <div class="operate-panel__row">
            <el-button @click="handleOperate(null, 'stop')">停用</el-button>
            <el-button type="primary" @click="handleOperate(null, 'new')">新增</el-button>
          </div>
        </div>
        <!-- <download-comp buisinessType="DS_STATISTICS"
                  fileType="EXCEL"
                  downloadType="LIST"
                  :buisinessField="{keyWord}"/> -->
      </template>
      <template #downArea>
        <el-table ref="table"
                  :data="statistics"
                  class="mt-6"
                  style="width: 100%"
                  @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55"></el-table-column>
          <!-- <el-table-column type="expand">
            <template #default="props">
              <stat-specs-detail :statId="props.row.id"/>
            </template>
          </el-table-column> -->
          <el-table-column label="编号" prop="number"/>
          <el-table-column label="中文名称" prop="cnName"/>
          <el-table-column label="英文名称" prop="enName"/>
          <el-table-column label="设立时间" prop="establishment"/>
          <el-table-column label="统计周期（年）" min-width="120" prop="cycle"/>
          <el-table-column label="统计口径">
            <template #default="scope">
              <el-tooltip popper-class="column-caliber-tooltip"
                          effect="dark"
                          placement="bottom"
                          class="item">
                <div slot="content" v-html="lineFeed(scope.row.caliber)"></div>
                <p class="truncate">{{scope.row.caliber}}</p>
              </el-tooltip>
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
          <el-table-column label="操作" width="300">
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

    <!-- 统计标准编辑弹窗 -->
    <dialog-edit-form :visible.sync="editVisible" :form="editForm"></dialog-edit-form>
    <!-- 文件上传 -->
    <dialog-file-upload :visible.sync="fileUploadVisible"></dialog-file-upload>
    <!-- 消息 -->
    <dialog-message-box :visible.sync="messageBoxVisible" :info="messageBoxData"></dialog-message-box>
  </div>
</template>

<script>
  import {
    Backtop as ElBacktop,
    Button as ElButton,
    Table as ElTable,
    TableColumn as ElTableColumn,
    Tooltip as ElTooltip,
  } from 'element-ui'

  import {
    Icon as EjIcon,
  } from '@ej/ui'

  import runtimeArgs from '@/runtime-args'
  // import QUERY_STATISTICS_LIST from '~/graphql/query_statistics_list.gql'
  import QUERY_DS_STATISTICALS from '~/graphql/statisticals/ds-statisticals-query.gql'
  import QUERY_DS_STATISTICAL from '~/graphql/statisticals/ds-statistical-query.gql'
  import QUERY_DS_EXPORT_STANDARD from '~/graphql/common/ds-export-standard-query.gql'
  import MUTATION_DS_SUBMIT_AUDIT from '~/graphql/audit/ds-submit-audit-mutation.gql'
  import MUTATION_DS_SUBMIT_AUDITS from '~/graphql/audit/ds-submit-audits-mutation.gql'
  import MUTATION_DS_DEL_STATISTICAL from '~/graphql/statisticals/ds-del-statistical-mutation.gql'
  import MUTATION_DS_ENABLE_STATISTICAL from '~/graphql/statisticals/ds-enable-statistical-mutation.gql'
  import MUTATION_DS_ENABLE_STATISTICALS from '~/graphql/statisticals/ds-enable-statisticals-mutation.gql'

  import SpecLayout from '~/components/spec-layout/index'
  // import DownloadComp from '~/components/download/index'
  // import StatSpecsDetail from '~/components/stat-specs/stat-specs-detail'
  import DialogEditForm from '~/components/stat-specs/dialog-edit'
  import DialogFileUpload from '~/components/stat-specs/dialog-upload'
  import DialogMessageBox from '~/components/common/message-box'
  import AuditStatusLabel from '~/components/common/audit-status-label'
  import StatusIcon from '~/components/common/status-icon'
  import {DsStandardStatus} from '~/components/standard-audit/detail/data'

  import MessageBoxMixins from '~/mixins/message-box'
  import {formatDate} from '~/utils/date'

  export default {
    name: 'StatSpecsView',
    mixins: [MessageBoxMixins],

    components: {
      ElBacktop,
      ElButton,
      ElTable,
      ElTableColumn,
      ElTooltip,
      SpecLayout,
      // DownloadComp,
      // StatSpecsDetail,
      DialogEditForm,
      DialogFileUpload,
      DialogMessageBox,
      AuditStatusLabel,
      StatusIcon,
      EjIcon,
    },

    data () {
      return {
        type: 'STATISTICS',
        fileUploadVisible: false,
        DsStandardStatus,
        operateList: [
          {key: 'mapping', label: '映射'},
          {key: 'edit', label: '编辑'},
          {key: 'del', label: '删除'},
          {key: 'stop-row', label: '停用'},
          {key: 'run', label: '启用'},
          {key: 'version', label: '版本历史'},
        ],

        expandrows: [],
        statistics: [],

        isLoading: false,
        isLock: false,
        noMore: false,

        keyWord: '',

        offset: 0,
        limit: 20,

        collectWatchedObj: {
          isCollect: false,
          isWatched: false,
        },
        editVisible: false,
        editForm: {},
        selTableItems: [],
        downloading: false,
        fileUploadUrl: runtimeArgs.NUXT_ENV_FILE_HTTP_ENDPOINT,
      }
    },

    created () {
      this.sendStatisticsData({offset: this.offset, limit: this.limit, keyWord: this.keyWord})
    },

    methods: {
      // stop
      onEnableStatisticals (params) {
        this.$apollo.mutate({
          mutation: MUTATION_DS_ENABLE_STATISTICALS,
          variables: {
            ...params,
          },
          update: (store, {data: {data}}) => {
            if (data) {
              // 提交审核
              this.onSubmitAudits({
                ids: params.ids,
                type: this.type,
                operation: 'UPDATE',
              }, {cb: this.handleSearch, cbParams: this.keyWord})
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
      // 单个项操作
      onEnableStatistical (params, cnName) {
        this.$apollo.mutate({
          mutation: MUTATION_DS_ENABLE_STATISTICAL,
          variables: {
            ...params,
          },
          update: (store, {data: {data}}) => {
            if (data) {
              // 提交审核
              this.onSubmitAudit({
                title: cnName,
                type: this.type,
                id: params.id,
                operation: 'UPDATE',
              }, {cb: this.handleSearch, cbParams: this.keyWord})
            }
          },
        })
      },
      // 提交审核 params = {title, type, id, operation}
      onSubmitAudit (params, {cb, cbParams} = {}) {
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
      onDelStatistical (id, cnName, auditStatus) {
        this.$apollo.mutate({
          mutation: MUTATION_DS_DEL_STATISTICAL,
          variables: {
            id,
          },
          update: (store, {data: {data}}) => {
            if (data) {
              if (auditStatus !== 'UNAUDITED') {
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
      async handleOperate (row, key) {
        let id
        let cnName
        let auditStatus
        let standardId
        if (row) {
          id = row.id
          cnName = row.cnName
          auditStatus = row.auditStatus
          standardId = row.standardId
        }
        const enableParams = {
          status: null,
        }
        if (['import', 'stop'].includes(key) && this.selTableItems.length === 0) {
          const obj = {
            import: '下载',
            stop: '停用',
          }
          let info = `请先选择需要${obj[key]}的数据！`
          this.$message.error(info)
          return
        }
        if (key === 'stop') {
          const deactivatedCount = this.selTableItems.filter(x => x.status === 'DEACTIVATE').length
          if (deactivatedCount > 0) {
            this.$message.error(`当前已选数据中，已包含${deactivatedCount}条禁用数据！`)
          }
          return
        }

        if (['stop-row', 'stop', 'run'].includes(key)) {
          const enableObj = {
            'stop-row': 'DEACTIVATE',
            'stop': 'DEACTIVATE',
            'run': 'ENABLE',
          }
          if (key === 'stop') {
            enableParams.ids = this.selTableItems.map(x => x.id)
          } else {
            enableParams.id = id
          }
          enableParams.status = enableObj[key]
        }

        switch (key) {
          case 'mapping': // 映射
            this.$router.push({name: 'stats-specs-detail', params: {id}})
            break
          case 'edit': //  编辑
          case 'new': // 新增
            this.showEditDialog(id, key)
            break
          case 'del': //  删除
            this.showMessageBox({
              content: '确认要删除该条数据吗？',
              confirm: () => {
                this.onDelStatistical(id, cnName, auditStatus)
              },
            })
            break
          case 'stop': // 停用
            this.onEnableStatisticals(enableParams)
            break
          case 'run': //  启用
          case 'stop-row': //  停用
            this.onEnableStatistical(enableParams, cnName)
            break
          case 'version': //  版本历史
            this.$router.push({name: 'common-version', params: {id: standardId, type: this.type}})
            break
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
        }
      },
      async showEditDialog (id, type) {
        this.editForm = {}
        if (type === 'edit') {
          // 查看详情
          await this.getDetail(id)
        }
        this.editVisible = true
      },
      async getDetail (id) {
        let {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_STATISTICAL,
          fetchPolicy: 'network-only',
          variables: {
            id,
          },
        })
        data = data || {}
        data.managerId = data.manager && data.manager.id
        this.editForm = data
      },
      handleSelectionChange (val) {
        this.selTableItems = val
      },
      /**
       * tooltip字体超过20个 折行显示
       */
      lineFeed (words) {
        if (!words) return ''

        if (words.length <= 20) {
          return words
        } else {
          return words.replace(/(.{20})/g, '$1' + `<br/>`)
        }
      },

      /**
       * 发送请求 获取统计数据
       */
      async sendStatisticsData (options) {
        if (this.isLoading) {
          return
        }

        this.isLoading = true
        this.noMore = false

        const {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_STATISTICALS,
          fetchPolicy: 'network-only',
          variables: {
            input: {...options},
          },
        })

        this.isLoading = false
        const {dsStatisticals} = data || []

        if (dsStatisticals) {
          dsStatisticals.forEach(x => {
            const listCopy = JSON.parse(JSON.stringify(this.operateList))
            if (x.establishment) {
              x.establishment = formatDate(x.establishment)
            }
            const operateList = []
            listCopy.forEach(l => {
              if (x.auditStatus === 'AUDITING' && ['edit', 'del', 'stop-row', 'run'].includes(l.key)) { // 审核中的，禁用
                l.disabled = true
              }
              if ((x.status === 'ENABLE' && l.key === 'run') || // 启用
                (x.status === 'DEACTIVATE' && l.key === 'stop-row')) { // 禁用
              } else {
                operateList.push(l)
              }
            })
            x.operateList = operateList
          })
          this.statistics = this.statistics.concat(dsStatisticals)
          this.offset = this.offset + this.limit
        } else {
          if (this.statistics.length > 0) {
            this.noMore = true
          }
          this.isLock = true
        }
      },

      handleSearch (arg) {
        this.keyWord = arg

        this.offset = 0

        this.statistics = []

        this.sendStatisticsData({offset: this.offset, limit: this.limit, keyWord: this.keyWord})
      },

      // async handleDetail (id) {
      //   if (this.expandrows.indexOf(id) < 0) {
      //     this.expandrows.push(id)
      //   } else {
      //     let index = this.expandrows.indexOf(id)
      //     if (index > -1) {
      //       this.expandrows.splice(index, 1)
      //     }
      //   }
      // },

      getKeyRows (row) {
        return row.id
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
          this.sendStatisticsData({offset: this.offset, limit: this.limit, keyWord: this.keyWord})
        }
      },
    },
  }
</script>

<style lang="scss">
  .stat-specs-view {

    @apply flex flex-1 flex-col;

    .el-table {
      margin-top: 100px;

      &__header-wrapper {
        position: fixed;
        top: 160px;
        z-index: 20;
      }

      &__body-wrapper {
        position: relative;
        margin-top: 33px;
      }

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

    // .el-table__header-wrapper {
    //   @apply fixed z-20;

    //   /*
    //    * 此设置，为了隐藏展开列icon
    //    * Table组件的展开列会默认在表格的第一列生成展开按钮
    //    * 隐藏按钮 会有空白，所以把宽度置为0
    //    * 下面同理
    //    **/
    //   col:nth-child(1) {
    //     width: 10px !important;
    //   }

    //   col:nth-child(2) {
    //     width: 238px !important;
    //   }
    // }

    // .el-table__body-wrapper {
    //   margin-top: 50px;

    //   col:nth-child(1) {
    //     width: 10px !important;
    //   }

    //   col:nth-child(2) {
    //     width: 238px !important;
    //   }
    // }

    // .el-table__header-wrapper tr th {
    //   @apply bg-purple-lighter text-black;
    // }

    // .el-table__expand-icon {
    //   display: none;
    // }

    // .el-table td.el-table__expand-column,
    // .el-table th.el-table__expand-column {
    //   padding: 0 !important;
    // }

    // .el-table__expanded-cell {
    //   background: #f5f5f5 !important;
    // }

  .column-caliber-tooltip {
    z-index: 18 !important;
  }
}
</style>
