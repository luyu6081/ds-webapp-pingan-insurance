export const labelList = [
  // {label: '标准ID', key: 'standardId', basis: 16.6},
  {label: '编号', key: 'number', basis: 16.6},
  {label: '类型', key: 'type', basis: 16.6},
  {label: '指标精度', key: 'accuracy', basis: 16.6},
  {label: '管理部门', key: 'department', basis: 16.6},
  {label: '管理员', key: 'manager', basis: 16.6},
  {label: '单位', key: 'unit', basis: 50},
  {label: '量纲', key: 'dimension', basis: 16.6},
  {label: '统计周期', key: 'cycle', basis: 16.6},
  {label: '计算公式', key: 'formula', basis: 100, type: 'textarea'},
  {label: '标准描述', key: 'description', basis: 100, type: 'textarea'},
  {label: '业务规则', key: 'rule', basis: 100, type: 'textarea'},
  {label: '统计口径', key: 'caliber', basis: 100, type: 'textarea'},
]

export const COLUMNS = function () {
  return [
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
      prop: 'fieldName',
      label: '字段',
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
              <el-button type="text" disabled={this.isReadOnly} onClick={(e) => this.onTableHandler(e, row, 'edit')}>编辑</el-button>
              <el-button type="text" disabled={this.isReadOnly} onClick={(e) => this.onTableHandler(e, row, 'delete')}>删除</el-button>
            </div>
          )
        })(this.$createElement)
      },
    },
  ]
}
