<template>
  <div class="index-manager-detail" v-ej-loading.fullscreen="loading">
    <div class="index-manager-detail__header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="(item, index) in menuList"
                            :key="index"
                            :to="{ path: item.path }">{{ item.label }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="index-manager-detail__content">
      <el-timeline>
        <el-timeline-item timestamp="指标说明" placement="top">
          <essentials-detail-card :list="indexDescribeValuesList"></essentials-detail-card>
        </el-timeline-item>
        <el-timeline-item timestamp="业务属性" placement="top">
          <essentials-detail-card :list="indexBusinessValuesList"></essentials-detail-card>
        </el-timeline-item>
        <el-timeline-item timestamp="技术属性" placement="top">
          <essentials-detail-card :list="techPropertyValuesList"></essentials-detail-card>
        </el-timeline-item>
        <el-timeline-item timestamp="管理属性" placement="top">
          <essentials-detail-card :list="managerPropertyValuesList"></essentials-detail-card>
        </el-timeline-item>
        <el-timeline-item timestamp="指标映射" placement="top">
          <ej-search-input v-model="keyWord"
                       width="180px"
                       height="34"
                       placeholder="请输入搜索条件"
                       @search="getMappingData"/>
          <common-table :list="mappingList" :columns="columns"></common-table>
          <busi-buttons :disabled="disabled" :show-button="['new']" @click="onMapDialogShow"/>
        </el-timeline-item>
      </el-timeline>
    </div>
    <!-- 弹窗提示 -->
    <dialog-message-box :visible.sync="messageBoxVisible"
                        :info="messageBoxData"></dialog-message-box>
    <!-- 映射弹窗 -->
    <dialog-mapping title="信息项标准映射"
                    :visible.sync="mappingVisible" :info="mappingForm"></dialog-mapping>
  </div>
</template>

<script>
  import {
    Breadcrumb as ElBreadcrumb,
    BreadcrumbItem as ElBreadcrumbItem,
    Timeline as ElTimeline,
    TimelineItem as ElTimelineItem,
    Button as ElButton,
  } from 'element-ui'

  import {
    SearchInput as EjSearchInput,
  } from '@ej/ui'

  import QUERY_DS_STATISTICAL from '~/graphql/index-manager/ds-statistical-query.gql'
  import QUERY_DS_STATISTICAL_MAPPINGS from '~/graphql/statisticals/ds-statistical-mappings-query.gql'
  import QUERY_DS_STATISTICAL_MAPPING from '~/graphql/statisticals/ds-statistical-mapping-query.gql'
  import MUTATION_DS_DEL_STATISTICALL_MAPPING from '~/graphql/statisticals/ds-del-statisticall-mapping-mutation.gql'

  import {mapActions, mapGetters} from 'vuex'
  import MessageBoxMixins from '~/mixins/message-box'

  import {indexDescribeValuesList, indexBusinessValuesList, techPropertyValuesList, managerPropertyValuesList, COLUMNS} from '~/components/index-manager/info/data'
  import EssentialsDetailCard from '~/components/essentials/detail-card'
  import CommonTable from '~/components/common/table'
  import DialogMessageBox from '~/components/common/message-box'
  import DialogMapping from '~/components/essentials/dialog-mapping'
  import BusiButtons from '~/components/busiButtons'

  export default {
    mixins: [MessageBoxMixins],
    components: {
      ElBreadcrumb,
      ElBreadcrumbItem,
      ElTimeline,
      ElTimelineItem,
      ElButton, // eslint-disable-line
      EssentialsDetailCard,
      CommonTable,
      DialogMapping,
      BusiButtons,
      DialogMessageBox,
      EjSearchInput,
    },
    computed: {
      ...mapGetters({
        userList: 'user/userList',
        techTree: 'techTree',
      }),
      loading () {
        return this.loadingCount !== 0
      },
      disabled () {
        return this.id === '-1'
      },
    },
    data () {
      return {
        type: 'STATISTICS',
        id: null,
        indexId: null,
        mappingVisible: false,
        mappingForm: {},
        menuList: [],
        loadingCount: 0,
        labelWidth: 130,
        indexDescribeValuesList: [],
        indexBusinessValuesList: [],
        techPropertyValuesList: [],
        managerPropertyValuesList: [],
        keyWord: '',
        columns: [],
        mappingList: [],
        isInitDetailInfo: false,
      }
    },
    mounted () {
      this.categoriesTechList()
      this.initData()
    },
    methods: {
      ...mapActions({
        categoriesTechList: 'categoriesTechList',
      }),
      async initData () {
        let {$route: {params: {id}}} = this
        this.id = id
        // 编辑获取数据
        this.getDetail()
        this.getMappingData()
        this.columns = COLUMNS.bind(this)()
      },
      async getMappingData () {
        const {id, keyWord} = this
        this.loadingCount++
        let {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_STATISTICAL_MAPPINGS,
          fetchPolicy: 'network-only',
          variables: {
            statisticalId: id,
            keyWord,
          },
        })
        this.loadingCount--
        this.mappingList = data || []
        this.columns = COLUMNS.bind(this)()
      },
      async getDetail () {
        try {
          this.loadingCount++
          let {data: {data}} = await this.$apollo.query({
            query: QUERY_DS_STATISTICAL,
            fetchPolicy: 'network-only',
            variables: {
              id: this.id,
            },
          })
          indexDescribeValuesList.map(x => {
            const {key} = x
            if (key === 'manager') {
              x.value = data.manager && data.manager.name
            } else {
              x.value = data[key]
            }
          })
          this.indexDescribeValuesList = indexDescribeValuesList
          indexBusinessValuesList.map(x => {
            const {key} = x
            if (key === 'dimensionIds') {
              x.value = data.dimensions && data.dimensions[0].name
            } else if (x === 'statisticalTime') {
              x.value = new Date(Number(data.statisticalTime))
            } else {
              x.value = data[key]
            }
          })
          this.indexBusinessValuesList = indexBusinessValuesList
          techPropertyValuesList.map(x => {
            const {key} = x
            if (key === 'dataSystem') {
              let value = ''
              if (data['platformName'] && data['systemName'] && data['dbName']) {
                value = `${data['platformName']}/${data['systemName']}/${data['dbName']}`
              }
              x.value = value
            } else {
              x.value = data[key]
            }
          })
          this.techPropertyValuesList = techPropertyValuesList
          managerPropertyValuesList.map(x => {
            const {key} = x
            if (key === 'presenter' || key === 'applyUser') {
              x.value = data[key] && data[key].name
            } else {
              x.value = data[key]
            }
          })
          this.managerPropertyValuesList = managerPropertyValuesList
          this.isInitDetailInfo = true
          const menuList = [
            {path: '/index-manager-list', label: '统计标准'},
            {path: '', label: data.cnName},
          ]
          this.menuList = menuList
          setTimeout(() => {
            this.isInitDetailInfo = false
          }, 0)
        } finally {
          this.loadingCount--
        }
      },
      onTableHandler (e, row, type) {
        const {id} = row
        switch (type) {
          case 'edit':
            this.getStatisticallMapping(id)
            break
          case 'delete':
            this.onDeleteStatisticallMapping(id)
            break
        }
      },
      onDeleteStatisticallMapping (id) {
        this.loadingCount++
        this.$apollo.mutate({
          mutation: MUTATION_DS_DEL_STATISTICALL_MAPPING,
          variables: {
            id,
          },
          update: (store, {data: {data}}) => {
            this.loadingCount--
            if (data) {
              this.$message.success('保存成功！')
              // 信息项
              this.getMappingData()
            }
          },
        }).catch(e => {
          this.loadingCount--
        })
      },
      async getStatisticallMapping (id) {
        this.loadingCount++
        let {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_STATISTICAL_MAPPING,
          fetchPolicy: 'network-only',
          variables: {
            id,
          },
        })
        this.loadingCount--
        this.onMapDialogShow('edit', data)
      },
      onMapDialogShow (type, mappingForm = {}) {
        this.mappingVisible = true
        this.mappingForm = mappingForm
      },
    },
  }
</script>

<style lang="scss">
  .index-manager-detail {
    @apply bg-white;

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
      @apply text-gray-darkest flex-1 flex flex-col;

      padding: 20px 24px 20px 34px;
      box-sizing: border-box;
      font-size: 14px;

      .el-form {
        .el-form-item {
          flex-basis: 25%;
        }
      }

      .common-buttons {
        width: 100%;
        text-align: center;
      }

      .btn-bar-group {
        margin-top: 84px;
        text-align: center;
      }
    }
  }
</style>
