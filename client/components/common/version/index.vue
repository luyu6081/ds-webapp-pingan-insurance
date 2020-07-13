<template>
  <div class="common-version" v-ej-loading.fullscreen="loading">
    <common-table ref="table" pagination :list="list" :columns="columns" :load="load"></common-table>
    <!-- 机构清单弹窗 -->
    <institutional-dialog :visible.sync="institutionalVisible" :info="institutionalInfo"></institutional-dialog>
  </div>
</template>

<script>
  import {
    Button as ElButton,
  } from 'element-ui'
  import CommonTable from '~/components/common/table'
  import {COLUMNS} from '~/components/common/version/data'
  import InstitutionalDialog from '~/components/common/version/institutional-dialog'

  import QUERY_DS_HISTORY_LIST from '~/graphql/history/ds-historys-query.gql'
  import QUERY_DS_HISTORY from '~/graphql/history/ds-history-query.gql'

  import {formatDate} from '~/utils/date'

  export default {
    components: {
      ElButton, // eslint-disable-line
      CommonTable,
      InstitutionalDialog,
    },
    data () {
      return {
        id: null,
        type: null, // 标准类型
        list: [],
        columns: [],
        loadingCount: 0,
        institutionalVisible: false,
        institutionalInfo: {}, // 机构清单版本历史弹窗
      }
    },
    computed: {
      loading () {
        return this.loadingCount !== 0
      },
    },
    mounted () {
      this.$nextTick(() => {
        this.initTableData()
      })
    },
    methods: {
      onTableHandler (e, row, type) {
        const {id} = row
        if (type === 'detail') { // 查看
          if (['STANDARD', 'STATISTICS', 'CODE'].includes(this.type)) { // 基础标准 统计标准 公共代码
            this.$router.push({path: '/detail-version', query: {id, standardId: this.id, type: this.type}})
          } else if (this.type === 'INSTITUTIONAL') { // 机构清单
            this.getHistoryDetail(id)
          }
        }
      },
      async getHistoryDetail (id) {
        this.loadingCount++
        let {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_HISTORY,
          fetchPolicy: 'network-only',
          variables: {
            id,
          },
        })
        this.loadingCount--
        data = data || {}
        data.contentObj = JSON.parse(data.content)
        this.institutionalInfo = data.contentObj
        this.institutionalVisible = true
      },
      async load () {
        const $table = this.$refs['table']
        const {id, type} = this.$route.params
        this.id = id
        this.type = type
        let {offset, limit} = $table
        const options = {
          offset,
          limit,
          type,
          standardId: id,
        }
        this.loadingCount++
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_HISTORY_LIST,
          fetchPolicy: 'network-only',
          variables: {
            input: {...options},
          },
        })
        this.loadingCount--
        let {dsHistorys, total} = data
        dsHistorys = dsHistorys || []
        dsHistorys.forEach(x => {
          x.createTm = formatDate(x.createTm)
        })
        this.list = dsHistorys
        $table.total = total
      },
      initTableData () {
        this.columns = COLUMNS.bind(this)()
        const $table = this.$refs['table']
        $table.init()
        this.load()
      },
    },
  }
</script>

<style lang="scss">
  .common-version {
    @apply bg-white flex-1;

    box-sizing: border-box;
    padding: 20px 30px;
    width: 100%;
  }
</style>
