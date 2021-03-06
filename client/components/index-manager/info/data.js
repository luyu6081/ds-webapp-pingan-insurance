// 指标说明
export const indexDescribeValuesList = [
  {label: '中文名称', key: 'cnName', type: 'text'},
  {label: '英文名称', key: 'enName', type: 'text'},
  {label: '数据管理部门', key: 'manageDepartmentName', type: 'text'},
  {label: '数据管理者', key: 'manager', type: 'text'},
]

// 业务属性
export const indexBusinessValuesList = [
  {label: '业务定义', key: 'definition', type: 'text'},
  {label: '业务规则', key: 'rule', type: 'text'},
  {label: '参考标准', key: 'reference', type: 'text'},
  {label: '计量单位', key: 'unit', type: 'text'},
  {label: '上报频度', key: 'frequency', type: 'text'},
  {label: '数据层次', key: 'arrangement', type: 'text'},
  {label: '映射类型', key: 'mappingType', type: 'text'},
  {label: '处理逻辑', key: 'processingLogic', type: 'text'},
  {label: '统计时间', key: 'statisticalTime', type: 'text'},
  {label: '指标维度', key: 'dimensionIds', type: 'text'},
]

// 技术属性
export const techPropertyValuesList = [
  {label: '数据类型', key: 'dataType', type: 'text'},
  {label: '数据源系统', key: 'dataSystem', type: 'text'},
  {label: '数据源表名称', key: 'dataTableId', type: 'text'},
  {label: '数据源字段名称', key: 'dataColumnId', type: 'text'},
]

// 管理属性
export const managerPropertyValuesList = [
  {label: '指标编码规则', key: 'codeRule', type: 'text'},
  {label: '数据需求提出部门', key: 'proposeDepartmentName', type: 'text'},
  {label: '数据需求提出者', key: 'presenter', type: 'text'},
  {label: '数据使用部门', key: 'applyDepartmentName', type: 'text'},
  {label: '数据使用者', key: 'applyUser', type: 'text'},
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
      prop: 'tableName',
      label: '列',
    },
    {
      prop: 'tableName',
      label: '检查规则',
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
