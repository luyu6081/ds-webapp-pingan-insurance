export const IssueNodeStatus = [
  {
    key: 'already',
    value: 'ALREADY',
    name: '已经办理',
    hatVal: {
      pass: 3,
      reject: 4,
    },
  },
  {
    key: 'process',
    value: 'PROCESS',
    name: '正在办理',
    hatVal: 2,
  },
  {
    key: 'not',
    value: 'NOT',
    name: '还没有办理',
    hatVal: 1,
  },
]

// 工单处理情况
export const DqsIssueOperateEnum = {
  PASS: '通过',
  // COMPLETION: '信息补全',
  REJECT: '驳回',
  // RESOLVE: '转发',
}

// 业务办理状态
export const HandleStateEnum = {
  ALREADY: '已经办理',
  PROCESS: '正在办理',
  NOT: '还没有办理',
}

// 审计状态
export const DsAuditStatus = {
  AUDITING: '审核中',
  UNAUDITED: '草稿',
  REJECTED: '拒绝',
  PASSED: '已通过',
}

export const DsStandardStatus = {
  ENABLE: '启用',
  DEACTIVATE: '禁用',
}

export const standardAuditAttribute = [
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
  {label: '公共代码', key: 'commonCode', type: 'text'},
]

export const standardBasicInfo = [
  // {
  //   label: '申请ID',
  //   key: 'id',
  //   type: 'text',
  // },
  {
    label: '申请人',
    key: 'creatorName',
    type: 'text',
  },
  {
    label: '标准类别',
    key: 'standardTypeLabel',
    type: 'text',
  },
  {
    label: '申请项目',
    key: 'project',
    type: 'text',
  },
  {
    label: '操作',
    key: 'typeLabel',
    type: 'text',
  },
]

export const basicAuditContent = [
  {
    label: '客户归属',
    list: [ // 基本信息内容
      [
        {label: '编号', key: 'number', type: 'text'},
        {label: '中文名称', key: 'cnName', type: 'text'},
        {label: '英文名称', key: 'enName', type: 'text'},
        {label: '别名', key: 'anName', type: 'text'},
        {label: '标准描述', key: 'description', type: 'textarea'},
        {label: '状态', key: 'status', type: 'text'},
        {label: '标准项类型', key: 'type', type: 'text'},
        {label: '访问热度', key: 'hot', type: 'text'},
        {label: '下载次数', key: 'downloads', type: 'text'},
        {label: '创建者', key: 'creator', type: 'text'}, // TODO
        {label: '更新者', key: 'modifier', type: 'text'}, // TODO
        {label: '版本', key: 'version', type: 'text'},
        {label: '审核状态', key: 'auditStatus', type: 'text'}, // TODO
        {label: '创建时间', key: 'createTm', type: 'text'},
        {label: '更新时间', key: 'modifyTm', type: 'text'},
      ],
    ],
  },
  {label: '信息项标准', list: []}, // standardAuditAttribute
]

// 基本信息
export const standardBasicList = [
  {
    title: '基本信息',
    list: [
      {label: '', list: [standardBasicInfo]},
    ],
  },
  {
    title: '审批内容',
    list: [], // basicAuditContent
  },
]

// 指标标准-审批内容-属性-指标说明
export const indexDescribeAttribute = [
  {label: '中文名称', key: 'cnName', type: 'text'},
  {label: '英文名称', key: 'enName', type: 'text'},
  {label: '数据管理部门', key: 'manageDepartmentName', type: 'text'},
  {label: '数据管理者', key: 'manager', type: 'text'},
]

// 指标标准-审批内容-属性-业务属性
export const indexBusinessAttribute = [
  {label: '业务定义', key: 'definition', type: 'text'},
  {label: '业务规则', key: 'rule', type: 'text'},
  {label: '参考标准', key: 'reference', type: 'text'},
  {label: '计量单位', key: 'unit', type: 'text'},
  {label: '上报频度', key: 'frequency', type: 'text'},
  {label: '数据层次', key: 'arrangement', type: 'text'},
  {label: '映射类型', key: 'mappingType', type: 'text'},
  {label: '处理逻辑', key: 'processingLogic', type: 'text'},
  {label: '统计时间', key: 'statisticalTime', type: 'text'},
  {label: '指标维度', key: 'dimensions', type: 'text'},
]

// 指标标准-审批内容-属性-技术属性
export const techPropertyAttribute = [
  {label: '数据类型', key: 'dataType', type: 'text'},
  {label: '数据源系统', key: 'dataSystem', type: 'text'},
  {label: '数据源表名称', key: 'dataTableName', type: 'text'},
  {label: '数据源字段名称', key: 'dataColumnName', type: 'text'},
]

// 指标标准-审批内容-属性-管理属性
export const managerPropertyAttribute = [
  {label: '指标编码规则', key: 'codeRule', type: 'text'},
  {label: '数据需求提出部门', key: 'proposeDepartmentName', type: 'text'},
  {label: '数据需求提出者', key: 'presenter', type: 'text'},
  {label: '数据使用部门', key: 'applyDepartmentName', type: 'text'},
  {label: '数据使用者', key: 'applyUser', type: 'text'},
]

// 指标标准-审核内容-块
export const statisticalAuditContent = [
  {label: '指标说明', list: []}, // indexDescribeAttribute
  {label: '业务属性', list: []}, // indexBusinessAttribute
  {label: '技术属性', list: []}, // techPropertyAttribute
  {label: '管理属性', list: []}, // managerPropertyAttribute
]

// 指标标准
export const statisticalList = [
  {},
  {
    title: '审批内容',
    list: [], // statisticalAuditContent
  },
]

// 机构清单-审批内容-属性
export const organizationsAuditAttribute = [
  {label: '编号', key: 'number', type: 'text'},
  {label: '中文名称', key: 'cnName', type: 'text'},
  {label: '英文名称', key: 'enName', type: 'text'},
  {label: '英文缩写', key: 'enAbridge', type: 'text'},
  {label: '标准描述', key: 'description', type: 'textarea'},
]

// 机构清单-审核内容-块
export const organizationsAuditContent = [
  {label: '', list: []}, // organizationsAuditAttribute
]

// 机构清单
export const organizationsList = [
  {},
  {
    title: '审批内容',
    list: [], // organizationsAuditContent
  },
]

// 公共代码-审批内容-属性
export const commonCodeAuditAttribute = [
  {label: '编号', key: 'number', type: 'text'},
  {label: '中文名称', key: 'cnName', type: 'text'},
  {label: '英文名称', key: 'enName', type: 'text'},
  {label: '编码规则', key: 'rule', type: 'text'},
  {label: '数据类型', key: 'type', type: 'text'}, // TODO
  {label: '数据长度', key: 'length', type: 'text'},
  {label: '业务含义', key: 'description', type: 'textarea'},
]

// 公共代码-审核内容-块
export const commonCodeAuditContent = [
  {label: '', list: []}, // commonCodeAuditAttribute
]

// 公共代码-
export const commonCodeList = [
  {},
  {
    title: '审批内容',
    list: [], // commonCodeAuditContent
  },
]

export const basicListData = {
  STANDARD: standardBasicList,
  STATISTICS: statisticalList,
  INSTITUTIONAL: organizationsList,
  CODE: commonCodeList,
}

// 转发给
export const transUser = {
  label: '转发给',
  value: '',
  key: 'userId',
  type: 'select',
  options: [],
  attrs: {
    filterable: true,
    remote: true,
    reserveKeyword: true,
    // remoteMethod: 'getUserList',
  },
}

// 校验状态
export const DsAuditCheckStatus = {
  UNCHECKED: '未校验', // 不允许审核
  CHECKING: '校验中', // 不允许审核
  SUCCESS: '校验成功', // 允许审核
  FAIL: '校验失败', // 不允许审核，返回失败原因
  ABNORMAL: '校验异常', // 允许审核，后端补充异常描述
}

export const fileCheckList =
  {
    list: [
      [
        {label: '校验状态', key: 'checkStatus', type: 'textarea'},
        {label: '描述', key: 'description', type: 'textarea'},
      ],
    ],
  }

// 审核表单
export const sourceInfoList = [
  {
    label: '审批状态',
    value: '',
    key: 'operation',
    type: 'radio',
    labels: [
      {label: '通过', value: 'PASS'},
      // {label: '信息补全', value: 'COMPLETION'},
      {label: '驳回', value: 'REJECT'},
      // {label: '转发', value: 'RESOLVE'},
    ],
  },
  // transUser,
  {
    label: '备注',
    value: '',
    key: 'opinion',
    type: 'textarea',
  },
]

export const sourceInfoRules = {
  operation: [
    {required: true, message: '请选择审批状态', trigger: 'change'},
  ],
  opinion: [
    {required: true, message: '请输入备注', trigger: 'blur'},
  ],
  userId: [
    {required: true, message: '请输入转发用户', trigger: 'blur'},
  ],
}
