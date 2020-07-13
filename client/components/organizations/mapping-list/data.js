export const COLUMNS = function () {
  return [
    // {
    //   prop: 'id',
    //   label: 'ID',
    // },
    {
      prop: 'platformName',
      label: '平台',
    },
    {
      prop: 'systemName',
      label: '系统',
    },
    {
      prop: 'dbName',
      label: '库',
    },
    {
      prop: 'tableName',
      label: '表',
    },
    {
      label: '操作',
      render: (row) => {
        return ((h) => {
          return (
            <div>
              <el-button type="text" onClick={(e) => this.onTableHandler(e, row, 'edit')}>编辑</el-button>
              <el-button type="text" onClick={(e) => this.onTableHandler(e, row, 'delete')}>删除</el-button>
            </div>
          )
        })(this.$createElement)
      },
    },
  ]
}
