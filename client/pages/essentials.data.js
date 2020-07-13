// 数据类型
export const dataTypeList = [
  'TINYINT',
  'SMALLINT',
  'MEDIUMINT',
  'INTEGER',
  'BIGINT',
  'FLOAT',
  'DOUBLE',
  'CHAR',
  'VARCHAR',
  'TINYBLOB',
  'TINYTEXT',
  'BLOB',
  'TEXT',
  'MEDIUMBLOB',
  'MEDIUMTEXT',
  'LONGBLOB',
  'LONGTEXT',
  'DATE',
  'TIME',
  'YEAR',
  'DATETIME',
  'TIMESTAMP',
]

export const levelList = [
  '一级',
  '二级',
  '三级',
  '四级',
]

// 公共代码详情
export const commonCodeDetailList = [
  {
    label: '公共代码',
    type: 'text',
    key: 'id',
    value: '',
  },
  {
    label: '名称',
    type: 'text',
    key: 'cnName',
    value: '',
  },
  {
    label: '描述',
    type: 'text',
    key: 'description',
    value: '',
  },
]

// 公共代码表单
export const commconCodeFormList = [
  {
    label: '公共代码',
    value: '',
    key: 'commonCodeId',
    type: 'select',
    contentActive: true, // 添加主题色
    options: [],
    attrs: {
      filterable: true,
      remote: true,
      reserveKeyword: true,
      // remoteMethod: 'getCommonCode',
    },
  },
]

export const essentialsCards = [
  {
    title: '信息项标准内容',
    type: 'form',
    modifyTm: '',
    form: {},
    list: [
      {
        label: '编号',
        value: '',
        key: 'indicia',
        type: 'text',
      },
      {
        label: '中文名称',
        value: '',
        key: 'cnName',
        type: 'text',
        placeholder: '请输入信息项标准',
      },
      {
        label: '英文名称',
        value: '',
        key: 'enName',
        type: 'text',
      },
      {
        label: '定义部门',
        value: '',
        key: 'department',
        type: 'text',
      },
      {
        label: '单位',
        value: '',
        key: 'unit',
        type: 'text',
      },
      {
        label: '管理员',
        value: '',
        key: 'managerId',
        type: 'select',
        contentActive: true, // 添加主题色
        options: [],
        attrs: {
          filterable: true,
          remote: true,
          reserveKeyword: true,
          // remoteMethod: 'getUserList',
        },
      },
      {
        label: '类型',
        value: '',
        key: 'type',
        type: 'text',
      },
      {
        label: '标准依据',
        value: '',
        key: 'accord',
        type: 'text',
      },
      {
        label: '定义原则',
        value: '',
        key: 'principle',
        type: 'text',
      },
      {
        label: '数据类型',
        value: '',
        key: 'dataType',
        type: 'select',
        options: dataTypeList.map(x => ({label: x, value: x})),
      },
      {
        label: '数据长度',
        value: '',
        key: 'dataLength',
        type: 'text',
        dataType: 'number',
      },
      {
        label: '重要等级',
        value: '',
        key: 'level',
        type: 'select',
        options: levelList.map((x, i) => ({label: x, value: i + 1})),
      },
      {
        label: '描述',
        value: '',
        key: 'description',
        type: 'textarea',
      },
      {
        label: '是否为空',
        value: null,
        key: 'canEmpty',
        type: 'radio',
        labels: [
          {label: '是', value: true},
          {label: '否', value: false},
        ],
      },
      {
        label: '获取方式',
        value: '',
        key: 'access',
        type: 'text',
      },
    ],
    rules: {
      cnName: [
        {required: true, message: '请输入中文名称', trigger: 'blur'},
      ],
      enName: [
        {required: true, message: '请输入英文名称', trigger: 'blur'},
      ],
      department: [
        {required: true, message: '请输入英文名称', trigger: 'blur'},
      ],
      managerId: [
        {required: true, message: '请输入管理员', trigger: 'blur'},
      ],
      dataLength: [
        {type: 'number', message: '必须为数字值', trigger: 'blur'},
      ],
    },
  },
  {
    title: '信息项编码',
    type: 'form',
    form: {
      commonCodeId: null,
    },
    list: [],
  },
  {
    title: '信息项标准映射信息',
    type: 'table',
    list: [],
    // columns 后期js添加。绑定this值
  },
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
      label: '申请人',
      render: (row) => {
        return ((h) => {
          return (
            <span>{row.creator && row.creator.name}</span>
          )
        })(this.$createElement)
      },
    },
    {
      prop: 'createTm',
      label: '申请时间',
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
              <el-button type="text" onClick={(e) => this.onTableHandler(e, row, 'edit')}>编辑</el-button>
              <el-button type="text" onClick={(e) => this.onTableHandler(e, row, 'delete')}>删除</el-button>
            </div>
          )
        })(this.$createElement)
      },
    },
  ]
}
