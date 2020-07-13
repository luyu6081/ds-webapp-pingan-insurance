<template>
  <div class="system-ranking-detail" v-ej-loading.fullscreen="loading">
    <div class="header">
      <ej-search-list ref="ejSearchList"
                      :models.sync="models"
                      :default-tag-more="true"
                      max-width-tag="100%"
                      app-key="DS"
                      :view-id="6070"
                      @search="handleSearch">
          <template #input>
            <ej-search-input v-model="keyWord" placeholder="请输入搜索条件" class="search-content-input" @search="handleSearch('btn')"/>
          </template>
          {{$store.getters.techTree}}
          <template #default>
            <ej-search-option-cascader v-model="models[datas[0].key]"
                                       :no-multiple="true"
                                       :prop="datas[0].key"
                                       :props="{label: 'name', value: 'id'}"
                                       :label="datas[0].label"
                                       :options="$store.getters.techTree"
                                       placeholder="请选择技术类目"/>
          </template>
      </ej-search-list>
    </div>
    <div class="content">
      <p class="content-desc">为您找到 “ <span class="content-record">{{ total }}</span> ” 条符合条件的数据</p>
      <el-table :data="systemRankingData" style="width: 100%">
        <el-table-column type="index" label="序号" width="50"></el-table-column>
        <el-table-column prop="platformName" label="平台"></el-table-column>
        <el-table-column prop="systemName" label="系统"></el-table-column>
        <el-table-column prop="dbName" label="库">
          <template #default="{row}">
            <!-- http://mds.dev.jinxin.cloud/#/search?categoryType=tech&categoryId=133235127336701952&categoryId=133235190964293632&categoryId=133258990472794112 -->
            <a :href="`${NUXT_ENV_MDS_HTTP}categoryId=${row.platformId}&categoryId=${row.systemId}&categoryId=${row.dbId}`" target="_blank" class="text-blue">{{row.dbName}}</a>
          </template>
        </el-table-column>
        <el-table-column prop="tableCount" label="表数量" width="120"></el-table-column>
        <el-table-column prop="createTm" label="库建设时间" width="180"></el-table-column>
        <el-table-column label="标准映射情况" width="120">
          <template #default="{row}">
            <span>{{row.mappingCount}} / {{row.mappingTotal}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="ruleCount" label="标准质量规则数" width="120"></el-table-column>
        <el-table-column prop="errorMapping" label="标准检查异常数" width="120"></el-table-column>
      </el-table>
      <el-pagination hide-on-single-page layout="prev, pager, next" :current-page="currentPage" :total="total" :page-size="pageSize" @current-change="handleCurrentChange"></el-pagination>
    </div>
  </div>
</template>

<script>
  import {
    Pagination as ElPagination,
    Table as ElTable,
    TableColumn as ElTableColumn,
  } from 'element-ui'

  import {
    SearchInput as EjSearchInput,
    SearchOptionCascader as EjSearchOptionCascader,
    SearchList as EjSearchList,
  } from '@ej/ui'

  import QUERY_DS_HOME_EXECUTION_SYSTEM_INFOS from '~/graphql/home/ds-home-execution-system-infos-query.gql'

  import {formatDate} from '~/utils/date'
  import runtimeArgs from '@/runtime-args'

  export default {
    name: 'system-ranking-page',
    components: {
      ElPagination,
      ElTable,
      ElTableColumn,
      EjSearchInput,
      EjSearchOptionCascader,
      EjSearchList,
    },

    computed: {
      loading () {
        return this.loadingCount !== 0
      },
      NUXT_ENV_MDS_HTTP () {
        return `${this.NUXT_ENV_MDS_HTTP1}/#/search?categoryType=tech&`
      },
    },

    data () {
      return {
        models: {
          system_path_tech: [],
        },
        keyWord: null,
        datas: [
          {
            key: 'system_path_tech',
            label: '技术类目',
            options: [],
          },
        ],
        systemRankingData: [],
        pageSize: 20,
        currentPage: 1,
        total: 0,
        loadingCount: 0,
        NUXT_ENV_MDS_HTTP1: runtimeArgs.NUXT_ENV_MDS_HTTP,
      }
    },

    mounted () {
      this.init()
      this.handleSearch()
    },

    methods: {
      init () {
        this.currentPage = 1
        this.total = 0
      },
      handleCurrentChange (currentPage) {
        this.currentPage = currentPage
        this.loadData()
      },
      async loadData () {
        let list = []
        if (this.modules) {
          list = this.modules.system_path_tech
        }
        const platformId = list[0]
        const systemId = list[1]
        const dbId = list[2]
        const input = {}
        if (platformId) input.platformId = platformId
        if (systemId) input.systemId = systemId
        if (dbId) input.dbId = dbId
        if (this.keyWord) input.keyWord = this.keyWord
        input.offset = (this.currentPage - 1) * this.pageSize
        input.limit = this.pageSize
        this.loadingCount++
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_HOME_EXECUTION_SYSTEM_INFOS,
          fetchPolicy: 'network-only',
          variables: {
            input,
          },
        })
        this.loadingCount--
        const {total, executionSystemInfos} = data || {}
        this.total = total
        if (executionSystemInfos) {
          executionSystemInfos.forEach(x => { x.createTm = formatDate(x.createTm) })
          this.systemRankingData = this.systemRankingData.concat(executionSystemInfos)
        }
      },
      handleSearch (type) {
        this.currentPage = 1
        this.loadData()
      },
    },
  }
</script>

<style lang="scss">
  .system-ranking-detail {
    @apply w-page bg-white flex-1;

    padding: 16px 24px;

    .header {
      .search-content-input {
        input {
          // width: 524px;
        }
      }
    }

    .content {
      @apply text-right;

      &-desc {
        @apply text-gray-darker text-sm my-4 text-left;
      }
      &-record {
        @apply text-blue;
      }

      .el-pagination {
        margin: 10px 0;
      }
    }
  }
</style>
