<script>
  import {
    Pagination as ElPagination,
    Table as ElTable,
    TableColumn as ElTableColumn,
    Button as ElButton,
  } from 'element-ui'

  export default {
    components: {
      ElPagination,
      ElTable,
      ElTableColumn,
      ElButton,
    },
    props: {
      list: Array,
      columns: Array,
      spanMethod: Function,
      selectionChange: {
        type: Function,
        default: () => {},
      },
      border: Boolean,
      pagination: Boolean, // 是否显示分页
      load: {
        type: Function,
        default: () => 1,
      },
    },
    computed: {
      offset () {
        return (this.currentPage - 1) * this.limit
      },
      isLastPage () {
        return Math.ceil(this.total / this.limit) === this.currentPage
      },
    },
    data () {
      return {
        limit: 20,
        total: 0,
        currentPage: 1,
      }
    },
    methods: {
      init () {
        this.total = 0
        this.currentPage = 1
        this.limit = 20
      },
      handleCurrentChange (currentPage) {
        this.currentPage = currentPage
        this.load && this.load()
      },
    },
    render (h) {
      const {list, border, spanMethod, selectionChange, pagination, currentPage, total, limit} = this
      const tableAttrs = {
        data: list,
        border,
        'span-method': spanMethod,
      }
      return (
        <div class="common-table-wrap">
          <el-table attrs = {{...tableAttrs}}
                    {...{on: {'selection-change': selectionChange}}}
                    header-align="center"
                    style="width: 100%;"
                    class="common-table">
            {
              this.columns.map((x, i) => {
                const {prop, label, width, render, showOverflowTooltip = true, type} = x
                const cplumnsAttrs = {
                  type,
                  prop,
                  label,
                  width,
                  'show-overflow-tooltip': showOverflowTooltip,
                  formatter: render,
                }
                return <el-table-column attrs = {{...cplumnsAttrs}}></el-table-column>
              })
            }
          </el-table>
          {
            // hide-on-single-page
          }
          {
            pagination ? <el-pagination background layout="prev, pager, next" current-page={currentPage} total={total} page-size={limit} {...{on: {'current-change': this.handleCurrentChange}}}></el-pagination> : ''
          }
        </div>
      )
    },
  }
</script>

<style lang="scss">
  .common-table {
    .cell {
      .el-button {
        @apply m-0;

        font-size: 14px;
        line-height: 22px;
        padding: 0 4px;
        outline: none;

        &--text {
          @apply text-blue;
        }
      }
    }

    &-wrap {
      @apply text-right flex-1 flex flex-col;

      width: 100%;

      .el-pagination {
        margin: 10px 0;
      }
    }
  }
</style>
