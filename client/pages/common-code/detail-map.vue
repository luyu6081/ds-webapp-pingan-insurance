<template>
  <div class="common-code-detail-map" v-ej-loading.fullscreen="loading">
    <div class="common-code-detail-map__left">
      <ej-search-input v-model="keywords"
                       width="100%"
                       height="34"
                       placeholder="请输入搜索条件"
                       @search="search"/>
      <menu-tree :data="tree"
                 ref="tree"
                 :filter-node-method="filterNode"
                 node-key="id"
                 :props="{children: 'children', label: 'name'}"
                 :default-expanded-keys="defaultExpandedKeys"
                 :expand-on-click-node="false"
                 @node-click="handleNodeClick">
        <div :class="['tree-menu', {'is-leaf': !data.children || !data.children.length}]" slot-scope="{node, data}">
          <span class="tree-menu-title">
            <ej-icon v-if="data.type === 'FOLDER'" icon="folder"></ej-icon>
            <ej-icon v-if="data.type === 'CATALOG'" icon="file"></ej-icon>
            <span class="tree-menu-title__text">{{data.name}}</span>
          </span>
        </div>
      </menu-tree>
    </div>
    <div class="common-code-detail-map__right">
      <div class="common-code-detail-map__header">
        <el-breadcrumb separator="/" class="float-left">
          <el-breadcrumb-item>标准内容</el-breadcrumb-item>
          <el-breadcrumb-item :to="{name: 'common-codes'}">公共代码列表</el-breadcrumb-item>
          <el-breadcrumb-item :to="{name: 'common-code-detail', query:{id}}">{{cnName}}</el-breadcrumb-item>
          <el-breadcrumb-item>系统映射</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="common-code-detail-map__content">
        <el-button class="new" type="primary" @click="onCreate" :disabled="!values.length">新建</el-button>
        <common-no-data v-if="!selTreeItem.id"></common-no-data>
        <div v-else class="table-box">
          <h3>{{ curNode.name}}_系统映射情况</h3>
          <common-table border :span-method="spanMethod" :list="list" :columns="columns"></common-table>
        </div>
      </div>
    </div>
    <!-- 系统映射弹窗 -->
    <dialog-info :visible.sync="DialogInfoVisible" :info="curMapItem" ></dialog-info>
    <!-- 消息 -->
    <dialog-message-box :visible.sync="messageBoxVisible" :info="messageBoxData"></dialog-message-box>

  </div>
</template>

<script>
  import {
    Breadcrumb as ElBreadcrumb,
    BreadcrumbItem as ElBreadcrumbItem,
    Button as ElButton,
  } from 'element-ui'

  import {
    Icon as EjIcon,
    SearchInput as EjSearchInput,
  } from '@ej/ui'

  import QUERY_DS_SYSTEM_MAPPINGS from '~/graphql/common-code/ds-system-mappings-query.gql'
  import QUERY_DS_COMMON_CODE_MAPPINGS from '~/graphql/common-code/ds-common-code-mappings-query.gql'
  import QUERY_DS_COMMON_CODE_VALUES from '~/graphql/common-code/ds-common-code-values-query.gql'
  import MUTATION_DS_DEL_COMMON_CODE_MAPPING from '~/graphql/common-code/ds-del-common-code-mapping-mutation.gql'

  import MenuTree from '~/components/menu-tree/index'
  import CommonTable from '~/components/common/table'
  import CommonNoData from '~/components/common/no-data'
  import DialogMessageBox from '~/components/common/message-box'
  import DialogInfo from '~/components/common-code/detail-map/dialog-info'

  import {COLUMNS} from '~/components/common-code/detail-map/data'
  import MessageBoxMixins from '~/mixins/message-box'

  export default {
    mixins: [MessageBoxMixins],
    components: {
      ElBreadcrumb,
      ElBreadcrumbItem,
      ElButton,
      MenuTree,
      CommonTable,
      CommonNoData,
      DialogMessageBox,
      DialogInfo,
      EjIcon,
      EjSearchInput,
    },
    computed: {
      loading () {
        return this.loadingCount !== 0
      },
    },
    data () {
      return {
        id: null,
        cnName: null,
        keywords: null,
        tree: [],
        curNode: null,
        defaultExpandedKeys: ['-1'],
        columns: [],
        list: [],
        selTreeItem: {},
        DialogInfoVisible: false,
        curMapItem: null,
        values: [],
        loadingCount: 0,
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      onCreate () {
        const {id, cnName} = this
        this.$router.push({path: 'common-code-map-create', query: {codeId: id, cnName}})
      },
      spanMethod ({row, column, rowIndex, columnIndex}) {
        if (columnIndex < 2) {
          if (columnIndex === 0) {
            return {
              rowspan: row.dbRowspan,
              colspan: 1,
            }
          } else if (columnIndex === 1) {
            return {
              rowspan: row.tbRowspan,
              colspan: 1,
            }
          } else {
            return {
              rowspan: 0,
              colspan: 0,
            }
          }
        }
      },
      onTableHandler (e, row, type) {
        const {id} = row
        switch (type) {
          case 'detail': // 查看
            this.curMapItem = row
            this.DialogInfoVisible = true
            break
          case 'edit': // 编辑
            this.$router.push({path: 'common-code-map-create', query: {id, cnName: this.cnName, codeId: this.id}})
            break
          case 'delete': // 删除
            this.showMessageBox({
              content: '确认要删除该条数据吗？',
              confirm: () => {
                this.loadingCount++
                this.$apollo.mutate({
                  mutation: MUTATION_DS_DEL_COMMON_CODE_MAPPING,
                  variables: {
                    id,
                  },
                  update: (store, {data: {data}}) => {
                    this.loadingCount--
                    if (data) {
                      this.message()
                      this.init()
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
      setCheckedKeys (node) {
        const {id} = node
        this.curNode = node
        this.$refs['tree'].setCheckedKeys([id])
        this.$nextTick(() => {
          this.$refs['tree'].setCurrentKey(id)
        })
      },
      async handleNodeClick (node) {
        const {id} = node
        if (id === '-1') return
        this.setCheckedKeys(node)
        this.selTreeItem = node
        this.loadingCount++
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_COMMON_CODE_MAPPINGS,
          fetchPolicy: 'network-only',
          variables: {
            systemId: id,
            codeId: this.id,
          },
        })
        this.loadingCount--
        // 库，表分组
        this.list = this.getGroupData(data || [])
      },
      getGroupData (data) {
        // 初始化表格
        data.forEach(x => {
          x.dbRowspan = 1
          x.tbRowspan = 1
        })
        const list = []
        // 库
        for (let i = 0, maxI = data.length; i < maxI; i += 1) {
          const isExist = list.findIndex(x => x.dbId === data[i].dbId) > -1
          if (!isExist) list.push(data[i])
        }
        // 表
        for (let i = 0; i < list.length; i += 1) {
          let filterList = data.filter(x => x.dbId === list[i].dbId && x.id !== list[i].id)
          const tbList = [list[i]] // 库中不重复的表
          if (filterList.length > 0) {
            filterList.forEach(x => { x.dbRowspan = 0 })
            list[i].dbRowspan += filterList.length
            for (let j = 0; j < filterList.length; j += 1) {
              const isExist = tbList.findIndex(x => x.tableId === filterList[j].tableId) > -1
              if (!isExist) tbList.push(filterList[j])
            }
            const tables = [list[i], ...filterList]
            for (let j = 0; j < tbList.length; j += 1) {
              const fitlerTbs = tables.filter(x => x.tableId === tbList[j].tableId && x.id !== tbList[j].id)
              fitlerTbs.forEach(x => { x.tbRowspan = 0 })
              if (fitlerTbs.length) {
                tbList[j].tbRowspan += fitlerTbs.length
              }
            }
            list.splice(i + 1, 0, ...filterList)
            i += filterList.length
          }
        }
        return list
      },
      search (...args) {
        this.$refs.tree.filter(args[0])
      },

      filterNode (value, data) {
        if (!value) return true
        return data.name.indexOf(value) !== -1
      },
      async getSystemMapping () {
        this.loadingCount++
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_SYSTEM_MAPPINGS,
          fetchPolicy: 'network-only',
          variables: {
            codeId: this.id,
          },
        })
        this.loadingCount--
        if (data && data.length) {
          data.forEach(x => { x.type = 'CATALOG' })
          this.tree = [
            {id: '-1', name: '系统名称', type: 'FOLDER', children: data},
          ]
        } else {
          this.tree = []
        }
        if (data && data.length) {
          this.handleNodeClick(data[0])
        } else {
          this.list = []
        }
      },
      init () {
        const {id, cnName} = this.$route.query
        this.id = id
        this.cnName = cnName
        this.getSystemMapping()
        this.columns = COLUMNS.bind(this)()
        this.getCommonCodeValues()
      },
      async getCommonCodeValues () {
        this.loadingCount++
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_COMMON_CODE_VALUES,
          fetchPolicy: 'network-only',
          variables: {
            codeId: this.id,
          },
        })
        this.loadingCount--
        this.values = data || []
      },
    },
    watch: {
      keywords (newVal) {
        this.search(newVal)
      },
    },
  }
</script>

<style lang="scss">
  .common-code-detail-map {
    @apply flex-1 flex flex-row;

    &__left,
    &__right {
      @apply bg-white;
    }

    &__left {
      width: 240px;
      margin-right: 16px;
      padding: 20px 24px;
      box-sizing: border-box;

      .essentials-view-tree {
        .el-tree-node {

          &.is-current {

            > .el-tree-node__content {
              .el-tree-node__label {
                @apply text-gray-darkest;

                background-color: #d4e4ff;
              }
            }
          }

          &__label {
            padding-left: 0.5rem !important;
            margin-left: 0.75rem;
            width: 100%;
          }
        }
      }
    }

    &__right {
      @apply flex-1 flex flex-col;
    }

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
      @apply relative flex-1;

      padding: 24px 27px;
      box-sizing: border-box;

      h3 {
        @apply text-gray-darkest font-bold inline-block;

        font-size: 14px;
        line-height: 32px;
        margin-bottom: 10px;
      }

      .new {
        @apply absolute;

        right: 21px;
        z-index: 1;
      }
    }
  }
</style>
