
export const COLUMNS = function () {
  return [
    {
      label: '库名',
      prop: 'dbName',
    },
    {
      label: '表名',
      prop: 'tableName',
    },
    {
      label: '字段',
      prop: 'fieldName',
    },
    {
      label: '检查规则',
      render: (row) => {
        return ((h) => {
          return (
            <div>
              {
                row.ruleNames.map((x, index) => {
                  return <el-button type="text">{ x }{index < row.ruleNames.length - 1 ? <span>、</span> : ''}</el-button>
                })
              }
            </div>
          )
        })(this.$createElement)
      },
    },
    {
      label: '操作',
      render: (row) => {
        return ((h) => {
          return (
            <div>
              <el-button type="text" onClick={(e) => this.onTableHandler(e, row, 'detail')}>查看</el-button>
              <el-button type="text" onClick={(e) => this.onTableHandler(e, row, 'edit')}>编辑</el-button>
              <el-button type="text" onClick={(e) => this.onTableHandler(e, row, 'delete')}>删除</el-button>
            </div>
          )
        })(this.$createElement)
      },
    },
  ]
}
