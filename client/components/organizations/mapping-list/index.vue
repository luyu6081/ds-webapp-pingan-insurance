<template>
  <div class="organizations-mapping-list">
    <div class="organizations-mapping-list__header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/organizations' }">机构清单</el-breadcrumb-item>
        <el-breadcrumb-item>映射列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="organizations-mapping-list__content">
      <ej-search-input v-model="keywords"
                       width="180px"
                       height="34"
                       placeholder="请输入搜索条件"
                       @search="search"/>
      <common-table :list="mappingList" :columns="columns"></common-table>
      <!-- 映射弹窗 -->
      <busi-buttons :show-button="['new']" @click="onMapDialogShow"/>

      <dialog-mapping :title="mapTitle"
                      :visible.sync="mappingVisible" :info="mappingForm"></dialog-mapping>

    </div>
    <!-- 弹窗提示 -->
    <dialog-message-box :visible.sync="messageBoxVisible"
                        :info="messageBoxData"></dialog-message-box>
  </div>
</template>

<script>
  import {
    Button as ElButton,
    Breadcrumb as ElBreadcrumb,
    BreadcrumbItem as ElBreadcrumbItem,
  } from 'element-ui'

  import {
    SearchInput as EjSearchInput,
  } from '@ej/ui'

  import QUERY_DS_INSTITUTIONAL_MAPPINGS from '~/graphql/organizations/ds-institutional-mappings-query.gql'
  import QUERY_DS_INSTITUTIONAL_MAPPING from '~/graphql/organizations/ds-institutional-mapping-query.gql'
  import MUTATION_DS_DEL_INSTITUTIONAL_MAPPING from '~/graphql/organizations/ds-del-institutional-mapping-mutation.gql'

  import BusiButtons from '~/components/busiButtons/busi-buttons'
  import CommonTable from '~/components/common/table'
  import DialogMessageBox from '~/components/common/message-box'
  import DialogMapping from '~/components/organizations/mapping-list/dialog-mapping'

  import {COLUMNS} from '~/components/organizations/mapping-list/data'

  import MessageBoxMixins from '~/mixins/message-box'

  export default {
    mixins: [MessageBoxMixins],
    components: {
      ElButton, // eslint-disable-line
      ElBreadcrumb,
      ElBreadcrumbItem,
      BusiButtons,
      CommonTable,
      DialogMapping,
      DialogMessageBox,
      EjSearchInput,
    },
    data () {
      return {
        id: null,
        keywords: null,
        mappingList: [],
        columns: [],
        mappingVisible: false,
        mappingForm: {},
        mapTitle: '',
      }
    },
    mounted () {
      this.initData()
    },
    methods: {
      search () {
        this.getMappingData()
      },
      initData () {
        this.id = this.$route.params.id
        this.getMappingData()
      },

      async getDetail (id) {
        let {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_INSTITUTIONAL_MAPPING,
          fetchPolicy: 'network-only',
          variables: {
            id,
          },
        })
        this.onMapDialogShow('edit', data)
      },

      async getMappingData () {
        let {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_INSTITUTIONAL_MAPPINGS,
          fetchPolicy: 'network-only',
          variables: {
            institutionalId: this.id,
            keyWord: this.keywords,
          },
        })
        this.mappingList = data || []
        this.columns = COLUMNS.bind(this)()
      },

      delRows (id) {
        this.$apollo.mutate({
          mutation: MUTATION_DS_DEL_INSTITUTIONAL_MAPPING,
          variables: {
            id,
          },
          update: (store, {data: {data}}) => {
            if (data) {
              this.message()
              // 刷新列表页面
              this.getMappingData()
            }
          },
        })
      },

      onTableHandler (e, row, type) {
        const {id} = row
        switch (type) {
          case 'edit': // 编辑
            this.getDetail(id)
            break
          case 'delete': // 删除
            this.showMessageBox({
              title: '映射项删除提示',
              content: '确定要删除当前映射项吗？',
              confirm: () => {
                this.delRows(id)
              },
            })
            break
        }
      },
      onMapDialogShow (type, mappingForm = {}) {
        const obj = {
          new: '新建',
          edit: '编辑',
        }
        this.mapTitle = `${obj[type]}映射`
        this.mappingVisible = true
        this.mappingForm = mappingForm
      },
    },
  }
</script>

<style lang="scss">
  .organizations-mapping-list {
    @apply bg-white flex-1;

    &__header {
      @apply text-gray-darkest;

      line-height: 50px;
      height: 50px;
      background-color: #f4f7fe;
      padding-left: 24px;
    }

    &__content {
      padding: 20px 24px;

      .common-buttons {
        @apply text-center;

        width: 100%;
        font-size: 14px;
        margin: 16px 0;
      }
    }

    .ej-input {
      margin-bottom: 20px;
    }
  }
</style>
