export const COLUMNS = function () {
  return [
    {
      label: '编码',
      render: (row) => {
        return ((h) => {
          return (
            <el-select disabled={!row.isEdit} v-model={row.codeValueId} placeholder="请选择">
              {
                this.values.map(x => {
                  return <el-option key={x.id} value={x.id} label={x.value}></el-option>
                })
              }
            </el-select>
          )
        })(this.$createElement)
      },
    },
    {
      label: '中文名称',
      render: (row) => {
        return ((h) => {
          return (
            <el-select disabled={!row.isEdit} v-model={row.codeValueId} placeholder="请选择">
              {
                this.values.map(x => {
                  return <el-option key={x.id} value={x.id} label={x.cnName}></el-option>
                })
              }
            </el-select>
          )
        })(this.$createElement)
      },
    },
    {
      label: '映射编码',
      render: (row) => {
        return ((h) => {
          return (
            <div>
              <el-input disabled={!row.isEdit} v-model={row.code} />
            </div>
          )
        })(this.$createElement)
      },
    },
    {
      label: '映射中文名称',
      render: (row) => {
        return ((h) => {
          return (
            <div>
              <el-input disabled={!row.isEdit} v-model={row.value} />
            </div>
          )
        })(this.$createElement)
      },
    },
    {
      label: '操作',
      render: (row, column, cellValue, index) => {
        return ((h) => {
          return (
            <div>
              <el-button disabled={row.isEdit} type="text" onClick={(e) => this.onTableHandler(e, row, 'edit', index)}>编辑</el-button>
              <el-button type="text" onClick={(e) => this.onTableHandler(e, row, 'delete', index)}>删除</el-button>
            </div>
          )
        })(this.$createElement)
      },
    },
  ]
}
