export const VERSION_DETAIL = {
  STANDARD: {
    name: 'essentials',
    label: '基础标准',
    basicList: [
      {label: '编号', key: 'number'},
      {label: '别名', key: 'anName'},
      {label: '描述', key: 'description', type: 'textarea'},
    ],
    attributes: [
      {
        label: '信息项标准内容',
        list: [
          {label: '编号', key: 'indicia', type: 'text'},
          {label: '中文名称', key: 'cnName', type: 'text'},
          {label: '英文名称', key: 'enName', type: 'text'},
          {label: '定义部门', key: 'department', type: 'text'},
          {label: '单位', key: 'unit', type: 'text'},
          {label: '管理员', key: 'manager', type: 'text'}, // TODO
          {label: '类型', key: 'type', type: 'text'},
          {label: '标准依据', key: 'accord', type: 'text'},
          {label: '定义原则', key: 'principle', type: 'text'},
          {label: '数据类型', key: 'dataType', type: 'text'},
          {label: '数据长度', key: 'dataLength', type: 'text'},
          {label: '重要级别', key: 'level', type: 'text'},
          {label: '描述', key: 'description', type: 'textarea'},
          {label: '是否为空', key: 'canEmpty', type: 'radio', labels: [{label: '是', value: true}, {label: '否', value: false}]},
          {label: '获取方式', key: 'access', type: 'text'},
        ],
      },
      {
        label: '信息项编码',
        list: [
          {label: '公共代码', key: 'commonCode', type: 'text'},
        ],
      },
    ], // 信息项标准内容
  },
  CODE: {
    name: 'common-codes',
    label: '公共代码',
    basicList: [
      {label: '编号', key: 'number', basis: 20},
      {label: '编码规则', key: 'rule', basis: 20},
      {label: '数据类型', key: 'type', basis: 20},
      {label: '数据长度', key: 'length', basis: 20},
      {label: '业务含义', key: 'description', basis: 100, type: 'textarea'},
    ],
  },
  INSTITUTIONAL: '机构清单',
  STATISTICS: {
    name: 'index-manager-list',
    label: '统计标准',
    basicList: [
      // {label: '编号', key: 'number', basis: 16.6},
      // {label: '类型', key: 'type', basis: 16.6},
      // {label: '指标精度', key: 'accuracy', basis: 16.6},
      // {label: '管理部门', key: 'department', basis: 16.6},
      // {label: '管理员', key: 'manager', basis: 16.6},
      // {label: '单位', key: 'unit', basis: 50},
      // {label: '量纲', key: 'dimension', basis: 16.6},
      // {label: '统计周期', key: 'cycle', basis: 16.6},
      // {label: '计算公式', key: 'formula', basis: 100, type: 'textarea'},
      // {label: '标准描述', key: 'description', basis: 100, type: 'textarea'},
      // {label: '业务规则', key: 'rule', basis: 100, type: 'textarea'},
      // {label: '统计口径', key: 'caliber', basis: 100, type: 'textarea'},
    ],
    typeList: [
      {
        label: '指标说明',
        list: [
          {label: '中文名称', key: 'cnName', basis: 25},
          {label: '英文名称', key: 'enName', basis: 25},
          {label: '数据管理部门', key: 'manageDepartmentName', basis: 25},
          {label: '数据管理者', key: 'manager', basis: 25},
        ],
      },
      {
        label: '业务属性',
        list: [
          {label: '业务定义', key: 'definition', basis: 25},
          {label: '业务规则', key: 'rule', basis: 25},
          {label: '参考标准', key: 'reference', basis: 25},
          {label: '计量单位', key: 'unit', basis: 25},
          {label: '上报频度', key: 'frequency', basis: 25},
          {label: '数据层次', key: 'arrangement', basis: 25},
          {label: '映射类型', key: 'mappingType', basis: 25},
          {label: '处理逻辑', key: 'processingLogic', basis: 25},
          {label: '统计时间', key: 'statisticalTime', basis: 25},
          {label: '指标维度', key: 'dimensions', basis: 25},
        ],
      },
      {
        label: '技术属性',
        list: [
          {label: '数据类型', key: 'dataType', basis: 25},
          {label: '数据源系统', key: 'dataSystem', basis: 25},
          {label: '数据源表名称', key: 'dataTableName', basis: 25},
          {label: '数据源字段名称', key: 'dataColumnName', basis: 25},
        ],
      },
      {
        label: '管理属性',
        list: [
          {label: '指标编码规则', key: 'codeRule', basis: 25},
          {label: '数据需求提出部门', key: 'proposeDepartmentName', basis: 25},
          {label: '数据需求提出者', key: 'presenter', basis: 25},
          {label: '数据使用部门', key: 'applyDepartmentName', basis: 25},
          {label: '数据使用者', key: 'applyUser', basis: 25},
        ],
      },
    ],
  },
}
