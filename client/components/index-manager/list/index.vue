<template>
  <div class="index-manager-list" v-ej-loading.fullscreen="loading">
    <div class="index-manager-list__left">
      <ej-search-input v-model="keywords"
                       width="100%"
                       height="34"
                       placeholder="请输入搜索条件"
                       @search="search"/>
      <menu-tree :data="tree"
                 ref="tree"
                 :filter-node-method="filterNode"
                 node-key="id"
                 :props="{children: 'children', label: 'cnName'}"
                 :default-expanded-keys="defaultExpandedKeys"
                 :expand-on-click-node="false"
                 @node-click="handleNodeClick">
        <div :class="['tree-menu', {'is-leaf': !data.children || !data.children.length}, `level-${node.level}`]"
              slot-scope="{node, data}">
          <span class="tree-menu-title">
            <ej-icon v-if="data.type === 'FOLDER'" icon="folder"></ej-icon>
          <span class="tree-menu-title__text">{{data.name}}</span></span>
          <div :class="['tree-menu-wrap', {'is-selected': data.showMore}]" @click.stop="onSetDropdownNode(data, node)">
            <el-dropdown trigger="click"  @command="handleCommand">
              <i class="icon-more"/>
              <el-dropdown-menu slot="dropdown" class="tree-dropdown-menu">
                <el-dropdown-item v-for="(value, index) in dropDownList"
                                  :key="index"
                                  :command="value.key"
                                  :disabled="value.disabled">{{ value.label }}</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
      </menu-tree>
    </div>
    <div class="index-manager-list__content">
      <div class="btn-group-icon">
        <el-button type="text" @click="handleOperate('export')"><ej-icon icon="export"></ej-icon>上传</el-button>
            <el-button type="text" @click="handleOperate('import')" :disabled="downloading" ><ej-icon icon="import"></ej-icon>下载</el-button>
      </div>
      <ej-search-list ref="ejSearchList"
                      :models.sync="form"
                      :keyword.sync="form.keyWord"
                      :view-id="viewId"
                      @search="onSearch"
                      @close="onClose">
        <ej-search-option-list prop="auditStatus" label="状态" :options="auditStatus" v-model="form.auditStatus" :showMore="true"  />
        <ej-search-option-list prop="status" label="使用状态" :options="status" v-model="form.status" :showMore="true"  />
        <!-- <ej-search-option-item ref="searchDimensions" :class="['dimensions-item', {'is-more': dimensionsIsMore}]" label="维度标签" :change="form.dimensions" :showMore="true">
          <ej-tag-list ref="tagList"
                       v-model="dimensions"
                       @click="handleClick"
                       @tag-create="handleTagCreate"
                       @tag-remove="handleTagRemove"/>
        </ej-search-option-item> -->
        <ej-search-option-list prop="dimensions" label="维度标签" :options="dimensions" v-model="form.dimensions" :showMore="true"  />
      </ej-search-list>
      <div class="btn-group">
        <p class="info">共{{ total }}条检索数据</p>
        <div class="btn-group__content">
          <el-button type="primary" @click="$router.push({path: `/index-manager/${curNode.id}/-1`})">新建</el-button>
          <el-button @click="handleOperate('run')">启用</el-button>
          <el-button @click="handleOperate('stop')">停用</el-button>
        </div>
      </div>
      <common-table ref="table" pagination :list="listData" :columns="columns" :selectionChange="handleSelectionChange" :load="loadDataList"></common-table>
    </div>
     <!-- 新建文件夹 -->
    <dialog-new-folder :visible.sync="newFolderVisible" :form="folderForm"></dialog-new-folder>

    <!-- 文件上传 -->
    <dialog-file-upload :visible.sync="fileUploadVisible"></dialog-file-upload>
    <!-- 消息 -->
    <dialog-message-box :visible.sync="messageBoxVisible" :info="messageBoxData"></dialog-message-box>
  </div>
</template>

<script>

  import {
    Button as ElButton,
    Dropdown as ElDropdown,
    DropdownMenu as ElDropdownMenu,
    DropdownItem as ElDropdownItem,
    // Select as ElSelect,
    // Option as ElOption,
    // Cascader as ElCascader,
  } from 'element-ui'

  import {
    Icon as EjIcon,
    SearchInput as EjSearchInput,
    SearchList as EjSearchList,
    SearchOptionList as EjSearchOptionList,
    // SearchOptionItem as EjSearchOptionItem,
  } from '@ej/ui'

  import runtimeArgs from '@/runtime-args'
  import {GetTreeNode, GetFirstNode} from '@/utils/tools'
  import {formatDate} from '~/utils/date'

  import QUERY_DS_INDEX_CLASSIIFICATION from '~/graphql/index-manager/ds-index-classification-query.gql'
  import QUERY_DS_DIMENSIONS from '~/graphql/index-manager/ds-dimensions-query.gql'
  import MUTATION_DS_SAVE_DIMENSION from '~/graphql/index-manager/ds-save-dimension-mutation.gql'
  import MUTATION_DS_DEL_DIMENSION from '~/graphql/index-manager/ds-del-dimension-mutation.gql'
  import QUERY_DS_STATISTICALS from '~/graphql/index-manager/ds-statisticals-query.gql'
  import MUTATION_DS_ENABLE_STATISTICALS from '~/graphql/statisticals/ds-enable-statisticals-mutation.gql'
  import MUTATION_DS_SUBMIT_AUDITS from '~/graphql/audit/ds-submit-audits-mutation.gql'
  import MUTATION_DS_DEL_STATISTICAL from '~/graphql/statisticals/ds-del-statistical-mutation.gql'
  import MUTATION_DS_SUBMIT_AUDIT from '~/graphql/audit/ds-submit-audit-mutation.gql'
  import QUERY_DS_EXPORT_STANDARD from '~/graphql/common/ds-export-standard-query.gql'
  import MUTATION_DS_DEL_INDEX_CLASSIIFICATION from '~/graphql/index-manager/ds-del-index-class-statistical-mutation.gql'

  import MenuTree from '~/components/menu-tree/index'
  import CommonTable from '~/components/common/table'
  import DialogNewFolder from '~/components/index-manager/list/dialog-new-folder'
  import DialogFileUpload from '~/components/stat-specs/dialog-upload'
  import {DsAuditStatus, DsStandardStatus} from '~/components/standard-audit/detail/data'
  import DialogMessageBox from '~/components/common/message-box'

  import {COLUMNS} from '~/components/index-manager/list/data'
  import MessageBoxMixins from '~/mixins/message-box'

  export default {
    mixins: [
      MessageBoxMixins,
    ],
    components: {
      ElButton,
      ElDropdown,
      ElDropdownMenu,
      ElDropdownItem,
      // ElSelect,
      // ElOption,
      // ElCascader,
      MenuTree,
      CommonTable,
      DialogNewFolder,
      DialogFileUpload,
      DialogMessageBox,
      EjIcon,
      EjSearchInput,
      EjSearchList,
      EjSearchOptionList,
      // EjSearchOptionItem,
    },
    computed: {
      viewId () {
        return ~new Date()
      },
      loading () {
        return this.loadingCount !== 0
      },
      auditStatus () {
        const keys = Object.keys(DsAuditStatus)
        return keys.map(x => {
          return {value: x, label: DsAuditStatus[x]}
        })
      },
      status () {
        const keys = Object.keys(DsStandardStatus)
        return keys.map(x => {
          return {value: x, label: DsStandardStatus[x]}
        })
      },
    },
    data () {
      return {
        type: 'STATISTICS',
        downloading: false,
        columns: [],
        listData: [],
        selList: [],
        loadingCount: 0,
        keywords: null,
        tree: [],
        defaultExpandedKeys: [2],
        dropdownNode: null, // dropdown 操作的node节点
        dropdownLevel: null,
        dropDownList: [
          {key: 'folder', label: '新建文件夹'},
          {key: 'rename', label: '重命名'},
          {key: 'delete', label: '删除'},
        ], // 树右侧下拉列表
        form: {
          keyWord: '',
          auditStatus: [],
          status: [],
          dimensions: [],
        },
        folderForm: {}, // 新建文件夹
        curNode: {}, // 当前选中node节点
        newFolderVisible: false,
        fileUploadVisible: false,
        dimensions: [], // 维度标签
        messageBoxVisible: false,
        messageBoxData: {},
        total: 0,
        fileUploadUrl: runtimeArgs.NUXT_ENV_FILE_HTTP_ENDPOINT,
        searchDimensionsVm: null,
        dimensionsIsMore: null,
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      emitSetSelected (...args) {
        this.loadDataList()
        return this.$refs.ejSearchList.emitSetSelected(...args)
      },
      getSelectedInfo ({key, text, list, value}) {
        const labelList = list
        let label = `${text}：${labelList.join('、')}`
        return {
          key,
          label,
        }
      },
      handleClick () {
        const {tag} = arguments[0]
        tag.selected = !tag.selected
        const labelList = this.dimensions.filter(x => x.selected === true).map(x => x.name).join('、')
        this.emitSetSelected({
          key: 'dimensions',
          label: `维度标签: ${labelList}`,
        })
      },
      handleTagCreate (name) {
        this.onSaveDimension({name})
      },
      handleTagRemove (tag, idx) {
        this.onDelDimension(tag.id)
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
                }, {cb: this.onSearch})
              } else {
                this.message({message: '删除成功！', type: 'success'})
                this.onSearch()
              }
            }
          },
        })
      },
      onTableHandler (e, row, type) {
        const {id, cnName, auditStatus, standardId} = row
        switch (type) {
          case 'edit': // 编辑
            this.$router.push({name: 'index-manager', params: {id, indexId: this.curNode.id}})
            break
          case 'delete': // 删除
            this.showMessageBox({
              content: '确认要删除该条数据吗？',
              confirm: () => {
                this.onDelStatistical(id, cnName, auditStatus)
              },
            })
            break
          case 'version': // 历史版本
            this.$router.push({name: 'common-version', params: {id: standardId, type: this.type}})
            break
          case 'detail':
            this.$router.push({name: 'index-manager-info', params: {id}})
            break
        }
      },
      init () {
        this.columns = COLUMNS.bind(this)()
        this.getIndexClassification() // 指标分类
        this.getDimensions() // 获取所有维度标签
        this.$nextTick(() => {
          this.searchDimensionsVm = this.$refs['searchDimensions']
        })
      },
      async handleOperate (type) {
        if (type === 'import' || type === 'stop' || type === 'run') {
          if (this.selList.length === 0) {
            this.$message.error('至少选择一条数据！')
            return
          }
        }
        switch (type) {
          case 'import': // 下载
            this.downloading = true
            this.$message.success('文件努力下载中...')
            const {data: {data}} = await this.$apollo.query({
              query: QUERY_DS_EXPORT_STANDARD,
              fetchPolicy: 'network-only',
              variables: {
                type: this.type,
                ids: this.selList.map(x => x.id),
              },
            })
            this.downloading = false
            if (data) {
              window.open(`${this.fileUploadUrl}fileDownload?ambryId=${data}`, '_blank')
            }
            break
          case 'export': // 上传
            this.fileUploadVisible = true
            break
          case 'stop': // 停用
          case 'run': // 启用
            const enableObj = {
              'stop': {label: '禁用', value: 'DEACTIVATE'},
              'run': {label: '启用', value: 'ENABLE'},
            }
            const runList = this.selList.filter(x => x.status === enableObj[type].value)
            if (runList.length > 0) {
              this.$message.error(`只能选择使用状态为${enableObj[type].label}数据！`)
              return
            }
            let params = {
              ids: this.selList.map(x => x.id),
              status: enableObj[type].value,
            }
            this.onEnableStatisticals(params)
            break
        }
      },
      onDelDimension (id) {
        this.$apollo.mutate({
          mutation: MUTATION_DS_DEL_DIMENSION,
          variables: {
            id,
          },
          update: (store, {data: {data}}) => {
            if (data) {
              this.$message.success('删除成功!')
              this.getDimensions()
            } else {
              this.$message.error('删除失败!')
            }
          },
        })
      },
      // input {id, name}
      onSaveDimension (input) {
        this.$apollo.mutate({
          mutation: MUTATION_DS_SAVE_DIMENSION,
          variables: {
            input,
          },
          update: (store, {data: {data}}) => {
            if (data) {
              this.$message.success('保存成功!')
              this.getDimensions()
            } else {
              this.$message.error('保存失败!')
            }
          },
        })
      },
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
              }, {cb: this.onSearch})
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
                this.$message.success('删除成功！')
              } else {
                this.$message.success('操作成功！')
              }
              if (typeof cb === 'function') {
                cb()
              }
            }
          },
        })
      },
      handleSelectionChange (val) {
        this.selList = val
      },
      // 获取所有维度标签
      async getDimensions () {
        try {
          this.loadingCount++
          const {data: {data}} = await this.$apollo.query({
            query: QUERY_DS_DIMENSIONS,
            fetchPolicy: 'no-cache',
          })
          this.dimensions = data.map(x => {
            return {value: x.id, label: x.name}
          })
          // this.dimensions = data.map(x => {
          //   const {id, name} = x
          //   return {id, name, removable: true, score: 0, selected: false}
          // })
        } finally {
          this.loadingCount--
        }
      },
      // 指标分类
      async getIndexClassification (id) {
        try {
          this.loadingCount++
          const {data: {data}} = await this.$apollo.query({
            query: QUERY_DS_INDEX_CLASSIIFICATION,
            fetchPolicy: 'no-cache',
          })
          data.forEach(x => {
            x.showMore = false
            x.type = 'FOLDER'
          })
          let tree = GetTreeNode(JSON.parse(JSON.stringify(data)))
          this.tree = tree
          let node = GetFirstNode(this.tree)
          if (id) { // 选中
            if (data.length) {
              node = data.filter(x => x.id === id)[0]
            }
          }
          this.curNode = node
          this.setCheckedKeys(node)
          this.defaultExpandedKeys.push(this.curNode.id)
          this.onSearch()
        } finally {
          this.loadingCount--
        }
      },
      setCheckedKeys (node) {
        const {id} = node
        this.curNode = node
        this.$refs['tree'].setCheckedKeys([id])
        this.$nextTick(() => {
          this.$refs['tree'].setCurrentKey(id)
        })
      },
      onClose (key) {
        console.log(key, 'onClose')
      },
      async loadDataList () {
        try {
          this.loadingCount++
          const {keyWord, auditStatus, status, dimensions} = this.form
          // const dimensions = this.dimensions.filter(x => x.selected === true).map(x => x.id)
          const $table = this.$refs['table']
          let {offset, limit} = $table
          let params = {
            indexId: this.curNode.id,
            offset,
            limit,
          }
          if (keyWord) { params.keyWord = keyWord }
          if (auditStatus.length) { params.auditStatuss = auditStatus }
          if (status.length) { params.statuss = status }
          if (dimensions.length) { params.dimensions = dimensions }
          let {data: {data}} = await this.$apollo.query({
            query: QUERY_DS_STATISTICALS,
            fetchPolicy: 'no-cache',
            variables: {
              input: params,
            },
          })
          data.dsStatisticals.forEach(x => {
            if (x.modifyTm) {
              x.modifyTm = formatDate(x.modifyTm)
            }
          })
          $table.total = data.total
          this.total = data.total || 0
          this.listData = data.dsStatisticals || []
        } finally {
          this.loadingCount--
        }
      },
      onSearch () {
        if (this.curNode.id === undefined) return
        const $table = this.$refs['table']
        $table.init()
        this.loadDataList()
      },
      search () {
        this.$refs.tree.filter(arguments[0])
      },
      filterNode (value, data) {
        if (!value) return true
        return data.name.indexOf(value) !== -1
      },
      handleNodeClick (node) {
        // 清除之前的选中样式
        if (this.dropdownNode && this.dropdownNode.showMore) {
          this.dropdownNode.showMore = false
        }
        this.curNode = node
        this.pageNumber = 1
        this.form.keyWord = ''
        this.form.auditStatus = []
        this.form.status = []
        this.form.dimensions = []
      },
      clearShowMoreStatus (list) {
        list.forEach(x => {
          x.showMore = false
          if (x.children && x.children.length) {
            this.clearShowMoreStatus(x.children)
          }
        })
      },
      // dropdown操作的node
      onSetDropdownNode (data, node) {
        // 清除之前选中
        this.clearShowMoreStatus(this.tree)
        data.showMore = true
        this.dropdownNode = data
        this.dropdownLevel = node.level
      },
      handleCommand (command) {
        const {id, pid, name} = this.dropdownNode
        const commandObj = {
          folder: '文件夹',
        }
        if ((command === 'folder' && this.dropdownLevel > 4 - 1) || (command === 'standard' && this.dropdownLevel > 4)) {
          this.$message.error(`最多只能新建${this.dropdownLevel - 1}级${commandObj[command]}`)
          return
        }
        switch (command) {
          case 'folder':
            this.newFolderVisible = true
            this.folderForm = {
              pid: id,
              name: '',
            }
            break
          case 'rename':
            this.newFolderVisible = true
            this.folderForm = {
              pid,
              id,
              name,
            }
            break
          case 'delete':
            this.showMessageBox({
              content: '确认要删除该文件夹吗？',
              confirm: () => {
                this.onDelStatisticalFile(id)
              },
            })
            break
        }
      },
      async onDelStatisticalFile (id) {
        this.$apollo.mutate({
          mutation: MUTATION_DS_DEL_INDEX_CLASSIIFICATION,
          variables: {
            id,
          },
          update: (store, {data: {data}}) => {
            if (data) {
              this.$message.success('删除成功！')
              this.getIndexClassification() // 指标分类
            } else {
              this.$message.error('删除失败！')
            }
          },
        })
      },
    },
    watch: {
      'searchDimensionsVm.isMore' (val) {
        this.dimensionsIsMore = val
      },
    },
  }
</script>

<style lang="scss">
  .index-manager-list {
    @apply flex flex-row;

    &__left,
    &__content {
      @apply bg-white;

      padding: 10px 20px;
      box-sizing: border-box;
    }

    &__left {
      width: 300px;
      margin-right: 20px;

      .tree-menu {
        @apply ml-3 w-full relative flex;

        &-wrap {
          @apply absolute right-0;
        }
        &-btns {
          @apply flex justify-end items-center;
        }
        &-btn {
          margin-left: 10px;
        }
        &-icon {
          @apply text-blue;
          width: 12px;
          height: 12px;
        }
        &-title {
          &:hover {
            @apply text-blue;
          }

          .ej-icon {
            @apply text-blue;

            width: 10px;
            height: 10px;
            display: inline-block;
          }
        }

        .el-icon-more {
          @apply inline-block font-bold;

          transform: rotate(90deg);
          font-size: 12px;
          color: #909399;
        }
      }

      .tree-menu-wrap {
        @apply absolute right-0;

        display: none;

        &.is-selected {
          display: block;
        }

        .icon-more {
          @apply inline-block bg-center bg-no-repeat align-middle;

          width: 16px;
          height: 16px;
          background-color: #d4e4ff;
          background-image: url('../../../assets/icon-more.svg');
          border-radius: 2px;
        }
      }

      .el-tree-node__content:hover {
        > .tree-menu {
          > .tree-menu-wrap {
            display: block;
          }
        }
      }

    }

    &__content {
      @apply flex-1;

      .ej-tag-item {
        margin-top: 7px;
        margin-bottom: 0;
      }

      .tag-count-btn {
        display: none !important;
      }

      .dimensions-item {
        &.is-more {
          .ej-conditions-item__content {
            overflow: visible;

            > div.max-w-full {
              overflow: visible;
            }
          }
        }

        .ej-conditions-item__content {

          > div.max-w-full {
            display: block;

            .ej-tag-list {
              display: block;

              .ej-tag-item,
              .relative {
                display: inline-block;
              }
            }
          }
        }
      }

      .btn-group-icon {
        @apply absolute;

        right: 30px;
      }

      .ej-icon {
        @apply text-blue inline-block;

        width: 12px;
        height: 12px;
        margin: 0 10px 0 0;
      }

      .btn-group {
        @apply relative;

        &__content {
          @apply inline-block absolute right-0;

          top: 0;
        }
      }

      .info {
        color: #999;

        margin: 13px 0;
        font-size: 12px;
        line-height: 32px;
      }

    }
  }
</style>
