<template>
  <div class="scoring-standards" v-ej-loading.fullscreen="loading">
    <ej-search-input v-model="keyWord"
                      height="34"
                      placeholder="请输入搜索条件"
                      @search="search"/>
    <el-table :data="list"
              style="width: 100%;"
              row-key="id"
              :tree-props="{children: 'platformScores'}">
      <el-table-column label="系统名称" prop="name"></el-table-column>
      <el-table-column label="近三个月数据标准得分" prop="score"></el-table-column>
      <el-table-column label="评分时间" prop="createTm"></el-table-column>
      <el-table-column label="错误分" prop="errorScore"></el-table-column>
      <el-table-column label="落地分" prop="completeScore"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="text" @click="onOperate('detail', scope.row)">详情</el-button>
          <el-button type="text" @click="onOperate('history', scope.row)">历史</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 详情弹窗 -->
    <setting-detail :visible.sync="detailVisible" :title="curRow.name" :id="curRow.id"></setting-detail>
    <!-- 历史弹窗 -->
    <setting-history :visible.sync="historyVisible" :title="curRow.name" :objectId="curRow.objectId"></setting-history>
  </div>
</template>

<script>
  import {
    Button as ElButton,
    Table as ElTable,
    TableColumn as ElTableColumn,
  } from 'element-ui'

  import {
    SearchInput as EjSearchInput,
  } from '@ej/ui'

  import SettingHistory from '~/components/setting/history'
  import SettingDetail from '~/components/setting/detail'

  import QUERY_DS_STANDARD_SCORE_ITEMS from '~/graphql/setting/ds-standard-score-items-query.gql'

  import {formatDate} from '~/utils/date'

  export default {
    name: 'scoring-standards',
    components: {
      ElButton,
      ElTable,
      ElTableColumn,
      SettingHistory,
      SettingDetail,
      EjSearchInput,
    },
    computed: {
      loading () {
        return this.loadingCount !== 0
      },
    },
    data () {
      return {
        historyVisible: false,
        detailVisible: false,
        curRow: {},
        keyWord: null,
        list: [],
        loadingCount: 0,
      }
    },
    mounted () {
      this.search()
    },
    methods: {
      async search (...args) { // args[0]  keyword
        this.list = await this.loadData()
      },
      async loadData () {
        this.loadingCount++
        let {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_STANDARD_SCORE_ITEMS,
          fetchPolicy: 'network-only',
          variables: {
            keyWord: this.keyWord,
          },
        })
        this.loadingCount--
        data = data || []
        data.forEach(x => {
          x.createTm = formatDate(x.createTm)
        })
        return data
      },
      onOperate (type, row) {
        this.curRow = row
        switch (type) {
          case 'detail': // 详情
            this.detailVisible = true
            break
          case 'history': // 历史
            this.historyVisible = true
            break
        }
      },
    },
  }
</script>

<style lang="scss">
  .scoring-standards {
    @apply text-right;

    box-sizing: border-box;
    padding: 17px 20px;

    .ej-input {
    }

    .el-table {
      margin-top: 16px;
    }
  }
</style>
