<template>
  <div class="organizations-view">
    <spec-layout key="organizations" fixedLayout @search="handleSearch" @keyword-change="handleKeywordChange">
      <template #searchRightArea>
        <!-- <download-comp buisinessType="DS_INSTITUTIONAL"
                  fileType="EXCEL"
                  downloadType="LIST"
                  :buisinessField="{keyWord}"/> -->
        <div class="operate-panel">
          <div class="operate-panel__row">
            <el-button type="text" @click="handleOperate(null, 'export')"><ej-icon icon="export"></ej-icon>上传</el-button>
            <el-button type="text" @click="handleOperate(null, 'import')" :disabled="downloading" ><ej-icon icon="import"></ej-icon>下载</el-button>
          </div>
          <div class="operate-panel__row">
            <el-button @click="handleOperate(null, 'stop')">停用</el-button>
            <el-button type="primary" @click="handleOperate(null, 'new')">新增</el-button>
            <!-- <el-button type="primary" @click="handleOperate(null, 'mapping')">映射</el-button> -->
          </div>
        </div>
      </template>
      <template #downArea>
        <el-table :data="organizations.dsInstitutionals || []"
                  row-key="id"
                  lazy
                  :load="load"
                  :tree-props="treeProps"
                  style="width: 100%"
                  @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="number" label="编号" width="300"/>
          <el-table-column prop="cnName" label="中文名称"/>
          <el-table-column prop="enName" label="英文名称"/>
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
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-dropdown trigger="click" @command="handleCommand">
                <div class="el-dropdown-link" @click="handleTableRowClick(scope.row)">
                  更多<i class="el-icon-arrow-down el-icon--right"></i>
                </div>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="item in curRowOperateList"
                                    :key="item.key"
                                    :disabled="item.disabled"
                                    :command="item.key">{{ item.label }}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
          <div v-if="isLoading" slot="append" class="pt-4 text-center h-16">
            <p v-ej-loading="isLoading" :class="{'pt-8' : isLoading}"></p>
          </div>
        </el-table>
        <common-pagination background
                           :current-page.sync="currentPage"
                           :page-size="organizations.limit"
                           :total="organizations.total"
                           @current-change="handleCurrentChange"/>
      </template>
    </spec-layout>

    <el-dialog :visible.sync="dialogOrgVisible" append-to-body>
      <div slot="title" class="clearfix">
        <h3 class="float-left text-2xl truncate w-3/4">{{organizationDetail.cnName + '（' + organizationDetail.enName + '）'}}</h3>
        <div class="float-right mr-20">
          <collect-and-watched v-model="collectWatchedObj" :operaId="organizationDetail.id || ''" type="DS_INSTITUTIONAL"/>
        </div>
      </div>
      <div class="flex">
        <div class="w-4/12 text-black">
          <label class="font-bold">标准ID：</label>
          <span>{{organizationDetail.id}}</span>
        </div>
        <div class="w-4/12 text-black">
          <label class="font-bold">编号：</label><span>{{organizationDetail.numberId}}</span>
        </div>
        <div class="w-4/12 text-black">
          <label class="font-bold">英文简写：</label><span>{{organizationDetail.enShorthand}}</span>
        </div>
      </div>
      <div class="mt-6 text-black">
        <h4 class="mb-3 font-bold">机构描述：</h4>
        <p>{{organizationDetail.description}}</p>
      </div>
    </el-dialog>

    <!-- 机构清单编辑弹窗 -->
    <dialog-edit-form :visible.sync="editVisible" :form="editForm"></dialog-edit-form>
    <!-- 详情弹窗 -->
    <dialog-detail :visible.sync="detailVisible" :info="editForm"></dialog-detail>
    <!-- 弹窗提示 -->
    <dialog-message-box :visible.sync="messageBoxVisible"
                        :info="messageBoxData"></dialog-message-box>
    <!-- 文件上传 -->
    <dialog-file-upload :visible.sync="fileUploadVisible"></dialog-file-upload>
  </div>
</template>

<script>
  import {
    Button as ElButton,
    Dialog as ElDialog,
    Dropdown as ElDropdown,
    DropdownMenu as ElDropdownMenu,
    DropdownItem as ElDropdownItem,
    Table as ElTable,
    TableColumn as ElTableColumn,
  } from 'element-ui'

  import {
    Icon as EjIcon,
  } from '@ej/ui'

  import Vue from 'vue'
  import runtimeArgs from '@/runtime-args'

  import QUERY_INSTITUTIONAL_DETAIL from '~/graphql/query_institutional_detail.gql'
  import QUERY_INSTITUTIONAL_CHILD_LIST from '~/graphql/organizations/institutional-child-list-query.gql'
  // import QUERY_INSTITUTIONAL_LIST from '~/graphql/query_institutional_list.gql'
  import QUERY_DS_EXPORT_STANDARD from '~/graphql/common/ds-export-standard-query.gql'
  import QUERY_DS_INSTITUTIONALS from '~/graphql/organizations/ds-institutionals-query.gql'
  import QUERY_DS_INSTITUTIONAL from '~/graphql/organizations/ds-institutional-query.gql'
  import MUTATION_DS_SUBMIT_AUDIT from '~/graphql/audit/ds-submit-audit-mutation.gql'
  import MUTATION_DS_SUBMIT_AUDITS from '~/graphql/audit/ds-submit-audits-mutation.gql'
  import MUTATION_DS_DEL_INSTITUTIONAL from '~/graphql/organizations/ds-del-institutional-mutation.gql'
  import MUTATION_DS_ENABLE_INSTITUTIONALS from '~/graphql/organizations/ds-enable-institutionals-mutation.gql'
  import MUTATION_DS_ENABLE_INSTITUTIONAL from '~/graphql/organizations/ds-enable-institutional-mutation.gql'

  import SpecLayout from '~/components/spec-layout'
  import CommonPagination from '~/components/pagination'
  import CollectAndWatched from '~/components/collectAndWatched'
  import AuditStatusLabel from '~/components/common/audit-status-label'
  import DialogFileUpload from '~/components/stat-specs/dialog-upload'
  import StatusIcon from '~/components/common/status-icon'
  import DialogEditForm from '~/components/organizations/dialog-edit'
  import DialogDetail from '~/components/organizations/dialog-detail'
  import DialogMessageBox from '~/components/common/message-box'

  import MessageBoxMixins from '~/mixins/message-box'

  Vue.use(CommonPagination)

  export default {
    name: 'OrganizationsView',
    mixins: [MessageBoxMixins],

    components: {
      ElButton,
      ElDialog,
      ElDropdown,
      ElDropdownMenu,
      ElDropdownItem,
      ElTable,
      ElTableColumn,
      SpecLayout,
      CollectAndWatched,
      AuditStatusLabel,
      StatusIcon,
      DialogEditForm,
      DialogDetail,
      DialogMessageBox,
      DialogFileUpload,
      EjIcon,
    },
    data () {
      return {
        type: 'INSTITUTIONAL',
        fileUploadVisible: false,
        dialogOrgVisible: false,

        keyWord: '',

        currentPage: 1,
        offset: 0,
        limit: 10,

        treeProps: {children: 'children', hasChildren: 'hasChildren'},
        organizations: {},

        organizationDetail: {},

        // 此处缓存了resolve方法，想通过这种方式来更新节点数据
        subDataResolve: null,
        subDataNode: [],

        rootId: 0, // 根节点id

        collectWatchedObj: {
          isCollect: false,
          isWatched: false,
        },
        selTableItems: [],
        operateList: [
          {key: 'detail', label: '查看'},
          {key: 'same', label: '新建同级'},
          {key: 'child', label: '新建子级'},
          {key: 'mapping', label: '映射'},
          {key: 'edit', label: '编辑'},
          {key: 'del', label: '删除'},
          {key: 'stop-row', label: '停用'},
          {key: 'run', label: '启用'},
          {key: 'version', label: '版本历史'},
        ],
        curRowOperateList: [],

        editVisible: false,
        editForm: {},
        curRow: {},

        detailVisible: false,
        downloading: false,
        fileUploadUrl: runtimeArgs.NUXT_ENV_FILE_HTTP_ENDPOINT,
      }
    },

    created () {
      this.sendOrganizationsData({offset: this.offset, limit: this.limit, keyWord: this.keyWord})
    },

    methods: {
      handleTableRowClick (row) {
        const {auditStatus, status} = row
        this.curRow = row
        const listCopy = JSON.parse(JSON.stringify(this.operateList))
        const operateList = []
        listCopy.forEach(l => {
          if (auditStatus === 'AUDITING' && ['same', 'child', 'edit', 'del', 'stop-row', 'run'].includes(l.key)) { // 审核中的，禁用
            l.disabled = true
          }
          if ((status === 'ENABLE' && l.key === 'run') || // 启用
            (status === 'DEACTIVATE' && l.key === 'stop-row')) { // 禁用
          } else {
            operateList.push(l)
          }
        })
        this.curRowOperateList = operateList
      },
      async showDialogDetail () {
        const {id} = this.curRow
        await this.getRowDetail(id)
        this.detailVisible = true
      },
      // 展示编辑弹窗
      async showDialogEdit (command) {
        const editForm = {} // new same child
        const {id, pid} = this.curRow
        if (command === 'same') {
          editForm.pid = pid
        } else if (command === 'child') {
          editForm.pid = id
        }
        this.editForm = editForm
        if (command === 'edit') { // 获取详情
          await this.getRowDetail(id)
        }
        this.editVisible = true
      },
      async getRowDetail (id) {
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_INSTITUTIONAL,
          fetchPolicy: 'network-only',
          variables: {
            id,
          },
        })
        this.editForm = data
      },
      delRowItem (id, title, auditStatus) {
        this.$apollo.mutate({
          mutation: MUTATION_DS_DEL_INSTITUTIONAL,
          variables: {
            id,
          },
          update: (store, {data: {data}}) => {
            if (data) {
              // 提交审核
              if (auditStatus !== 'UNAUDITED') { // 非草稿
                this.onSubmitAudit({
                  title,
                  type: this.type,
                  id,
                  operation: 'DEL',
                }, {cb: this.handleSearch, cbParams: this.keyWord}) // 刷新列表页面
              } else {
                this.message({message: '删除成功！', type: 'success'})
                this.handleSearch(this.keyWord)
              }
            }
          },
        })
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
      enableRowItem (params, title) {
        this.$apollo.mutate({
          mutation: MUTATION_DS_ENABLE_INSTITUTIONAL,
          variables: {
            ...params,
          },
          update: (store, {data: {data}}) => {
            if (data) {
              // 提交审核
              this.onSubmitAudit({
                title,
                id: params.id,
                type: this.type,
                operation: 'UPDATE',
              }, {cb: this.handleSearch, cbParams: this.keyWord})
            }
          },
        })
      },
      enableRows (params) {
        this.$apollo.mutate({
          mutation: MUTATION_DS_ENABLE_INSTITUTIONALS,
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
      handleCommand (command) {
        const {id, cnName, auditStatus, standardId} = this.curRow

        const enableParams = {}
        if (['stop-row', 'stop', 'run'].includes(command)) {
          const enableObj = {
            'stop-row': 'DEACTIVATE',
            'stop': 'DEACTIVATE',
            'run': 'ENABLE',
          }
          if (command === 'stop') {
            enableParams.ids = this.selTableItems.map(x => x.id)
          } else {
            enableParams.id = id
          }
          enableParams.status = enableObj[command]
        }
        switch (command) {
          case 'detail': // 查看
            this.showDialogDetail()
            break
          case 'same': // 新建同级
          case 'child': // 新建子级
          case 'edit': // 编辑
            this.showDialogEdit(command)
            break
          case 'mapping': // 映射
            this.$router.push({name: 'organizationsMappingList', params: {id}})
            break
          case 'del': // 删除
            this.showMessageBox({
              title: '机构清单删除提示',
              content: '确定要删除当前项吗？',
              confirm: () => {
                this.delRowItem(id, cnName, auditStatus)
              },
            })
            break
          case 'stop': // 停用
            this.enableRows(enableParams)
            break
          case 'stop-row': // 停用
          case 'run': // 启用
            this.enableRowItem(enableParams, cnName)
            break
          case 'version': // 版本历史
            this.$router.push({name: 'common-version', params: {id: standardId, type: this.type}})
            break
        }
      },
      handleSelectionChange (val) {
        this.selTableItems = val
      },
      async handleOperate (id, type) {
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
          }
          return
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
          case 'stop-row': // 停用
          case 'run': // 启用
            this.handleCommand(type)
            break
          case 'new': // 新增
            this.showDialogEdit(type)
            break
          // case 'mapping': // 映射
          //   break
        }
      },
      /**
       * 发送请求 获取机构列表数据
       */
      async sendOrganizationsData (options) {
        this.isLoading = true
        let {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_INSTITUTIONALS,
          fetchPolicy: 'network-only',
          variables: {
            input: {...options},
          },
        })
        data = data || {}
        this.organizations = data
        this.isLoading = false
      },

      async handleDetail (instiId) {
        this.dialogOrgVisible = true

        const respData = await this.$apollo.query({
          query: QUERY_INSTITUTIONAL_DETAIL,
          fetchPolicy: 'network-only',
          variables: {
            id: instiId,
          },
        })
        const institutionalDetail = respData.data.institutionalDetail
        if (institutionalDetail) {
          this.organizationDetail = institutionalDetail
          this.collectWatchedObj = {
            isCollect: this.organizationDetail.isCollect,
            isWatched: this.organizationDetail.isSubscribe,
          }
        }
      },

      handleKeywordChange (args) {
        this.keyWord = args
      },

      handleSearch (args) {
        this.keyWord = args

        this.offset = 0

        this.currentPage = 1

        this.organizations = {}
        if (this.subDataNode.length > 0 && this.subDataResolve) {
          this.subDataNode.map(sdn => {
            this.load(sdn, {}, this.subDataResolve)
            return sdn
          })
        }

        this.sendOrganizationsData({offset: this.offset, limit: this.limit, keyWord: this.keyWord})
      },

      handleCurrentChange (page) {
        this.currentPage = page
        this.offset = (page - 1) * this.limit
        this.sendOrganizationsData({offset: this.offset, limit: this.limit, keyWord: this.keyWord})
      },

      /**
       * 发送请求 获取机构子节点数据
       */
      async load (tree, treeNode, resolve) {
        if (Number(tree.pid) === Number(this.rootId)) {
          this.subDataNode.push(tree)
          this.subDataResolve = resolve
        }

        const {data: {data}} = await this.$apollo.query({
          query: QUERY_INSTITUTIONAL_CHILD_LIST,
          fetchPolicy: 'network-only',
          variables: {
            id: tree.id,
            keyWord: this.keyWord,
          },
        })
        const subList = data || []
        if (subList) {
          setTimeout(() => { resolve(subList) }, 500)
        } else {
          resolve([])
        }
      },
    },
  }
</script>

<style lang="scss">
  .organizations-view {
    @apply flex-1;

    .el-dialog {
      @apply w-page;

      .el-dialog__headerbtn {
        outline: none !important;
      }
    }

    .el-dialog__title {
      @apply text-black;
    }

    .el-pagination {
      text-align: right;
    }

    .el-table {
      margin-top: 90px;
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

    .el-dropdown-link {
      @apply text-blue cursor-pointer;
    }
  }
</style>
