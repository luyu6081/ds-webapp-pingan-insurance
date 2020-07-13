export const labelList = [
  // {label: '标准ID', key: 'standardId', basis: 20},
  {label: '编号', key: 'number', basis: 20},
  {label: '编码规则', key: 'rule', basis: 20},
  {label: '数据类型', key: 'type', basis: 20},
  {label: '数据长度', key: 'length', basis: 20},
  {label: '业务含义', key: 'description', basis: 100, type: 'textarea'},
]

export const COLUMNS = function () {
  return [
    {
      prop: 'value',
      label: '编码',
    },
    {
      prop: 'cnName',
      label: '中文名称',
    },
    {
      prop: 'enName',
      label: '英文名称',
    },
    {
      prop: 'description',
      label: '业务含义',
    },
    {
      label: '操作',
      render: (row) => {
        return ((h) => {
          return (
            <div>
              <el-button type="text" disabled={this.isReadOnly} onClick={(e) => this.onTableHandler(e, row, 'edit')}>编辑</el-button>
              <el-button type="text" disabled={this.isReadOnly} onClick={(e) => this.onTableHandler(e, row, 'delete')}>删除</el-button>
            </div>
          )
        })(this.$createElement)
      },
    },
  ]
}
