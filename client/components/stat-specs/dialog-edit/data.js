export const statisticalList = [
  {label: '编号', key: 'number', type: 'text'},
  {label: '中文名称', key: 'cnName', type: 'text'},
  {label: '英文名称', key: 'enName', type: 'text'},
  {label: '类型', key: 'type', type: 'text'},
  {label: '指标精度', key: 'accuracy', type: 'text'},
  {label: '管理部门', key: 'department', type: 'text'},
  {label: '管理员', key: 'managerId', type: 'select', options: [], attrs: {filterable: true, remote: true, reserveKeyword: true}},
  {label: '单位', key: 'unit', type: 'text'},
  {label: '量纲', key: 'dimension', type: 'text'},
  {label: '统计周期', key: 'cycle', type: 'text', dataType: 'number'},
  {label: '计算公式', key: 'formula', type: 'textarea'},
  {label: '标准描述', key: 'description', type: 'textarea'},
  {label: '业务规则', key: 'rule', type: 'textarea'},
  {label: '统计口径', key: 'caliber', type: 'textarea'},
]

export const statisticalRules = {
  cnName: [
    {required: true, message: '请输入中文名称', trigger: 'blur'},
  ],
  enName: [
    {required: true, message: '请输入英文名称', trigger: 'blur'},
  ],
  number: [
    {required: true, message: '请输入编号', trigger: 'blur'},
  ],
  cycle: [
    {type: 'number', message: '必须为数字值', trigger: 'blur'},
  ],
}
