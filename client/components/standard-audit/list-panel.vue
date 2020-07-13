<template>
  <div class="standard-audit-list-panel"  v-ej-loading.fullscreen="loading">
    <div class="standard-audit-list-panel__header">
      <!-- <ej-search-input v-if="searchInputShow" v-model="keyword" clearable placeholder="请输入..." @search="load"/> -->
      <el-button v-if="allPassShow && canAuditing" type="primary" :disabled="list.length === 0" @click="onAllPass">全部通过</el-button>
    </div>
    <common-table ref="table" pagination :list="list" :columns="columns" :load="load"></common-table>
  </div>
</template>

<script>
  import {
    Button as ElButton,
  } from 'element-ui'

  import {mapGetters, mapActions} from 'vuex'

  import QUERY_DS_AUDITS from '~/graphql/audit/ds-audits-query.gql'
  import MUTATION_DS_COMPLETE_AUDIT from '~/graphql/audit/ds-complete-audit-mutation.gql'

  import CommonTable from '~/components/common/table'
  import {COLUMNS, TODO_COLUMNS, RELATED_COLUMNS, CLOSED_COLUMNS} from './list-panel-data'

  export default {
    components: {
      CommonTable,
      ElButton,
    },
    props: {
      panelType: String,
    },
    data () {
      return {
        list: [],
        columns: [],
        keyword: null,
        loading: false,
      }
    },
    computed: {
      ...mapGetters({
        'activeTab': 'audit/activeTab',
        'paneList': 'audit/paneList',
      }),
      searchInputShow () {
        return this.activeTab !== 'complete'
      },
      allPassShow () {
        return this.activeTab === 'OPEN'
      },
      userData () {
        return this.$nuxt.$app.state.me
      },
      canAuditing () {
        let {permissionCodes} = this.userData
        permissionCodes = permissionCodes || []
        return permissionCodes.includes('dsAuditApproval')
      },
    },
    mounted () {
      this.init()
    },
    methods: {
      ...mapActions({
        'setActiveTab': 'audit/setActiveTab',
        'setPaneList': 'audit/setPaneList',
      }),
      init () {
        // this.form.keyword = null
        const $table = this.$refs['table']
        $table.init()
        this.load()
        let columns = COLUMNS.bind(this)()
        let items
        switch (this.panelType) {
          case 'OPEN': // 待审核
            items = TODO_COLUMNS.bind(this)()
            if (this.canAuditing) {
              columns.push(...items)
            }
            break
          case 'RELATED': // 与我相关
            items = RELATED_COLUMNS.bind(this)()
            columns.push(...items)
            break
          case 'CLOSED': // 已完成
            items = CLOSED_COLUMNS.bind(this)()
            columns.push(...items)
            break
        }
        this.columns = columns
      },
      async load () {
        const $table = this.$refs['table']
        let {offset, limit} = $table
        const input = {
          offset,
          limit,
          type: this.panelType,
        }
        this.loading = true
        let {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_AUDITS,
          fetchPolicy: 'network-only',
          variables: {
            input,
          },
        })
        this.loading = false
        let {total} = data
        $table.total = total
        this.setPaneListTotal(total)
        this.list = data.data || []
      },
      setPaneListTotal (total) {
        if (this.paneList) {
          const paneList = JSON.parse(JSON.stringify(this.paneList))
          paneList
            .filter(x => x.name === this.panelType)
            .forEach(x => {
              x.total = total
            })
          this.setPaneList(paneList)
        }
      },
      onAllPass () {
        const ids = this.list.map(x => x.id)
        this.onHandlerPass(ids, true)
      },
      onRowClick (e, data, type) {
        const {id} = data
        if (type === 'pass') {
          this.onHandlerPass([id])
        }
      },
      onHandlerPass (list, passAll) {
        this.loading = true
        this.$apollo.mutate({
          mutation: MUTATION_DS_COMPLETE_AUDIT,
          variables: {
            input: {
              auditIds: list,
              opinion: '通过',
              operation: 'PASS',
            },
          },
          update: (store, {data: {data}}) => {
            this.loading = false
            if (data) {
              this.$message({
                message: '操作成功！',
                type: 'success',
              })
              if (passAll) {
                const $table = this.$refs['table']
                if ($table.isLastPage) {
                  $table.currentPage -- // eslint-disable-line
                }
              }
              this.load()
            }
          },
        })
      },
    },
    watch: {
      activeTab () {
        this.init()
      },
    },
  }
</script>

<style lang="scss">
  .standard-audit-list-panel {
    &__header {

      .ej-input {
        width: 400px !important;
        margin-bottom: 15px;
      }

      .el-button {
        float: right;
        margin-bottom: 15px;
      }
    }

    .common-table .cell .status-type {
      &.ADD {
        color: #FA541C;
      }

      &.UPDATE {
        color: #52C41A;
      }

      &.DEL {
        color: #8C8C8C;
      }
    }
  }
</style>
