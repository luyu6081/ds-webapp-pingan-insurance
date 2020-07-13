import {dataTypeList} from '~/pages/essentials.data'

export const commonCodeList = [
  {label: '编号', key: 'number', type: 'text'},
  {label: '中文名称', key: 'cnName', type: 'text'},
  {label: '英文名称', key: 'enName', type: 'text'},
  {label: '编码规则', key: 'rule', type: 'text'},
  {label: '数据类型', key: 'type', type: 'select', options: dataTypeList.map(x => ({label: x, value: x}))},
  {label: '数据长度', key: 'length', type: 'text', dataType: 'number'},
  {label: '业务含义', key: 'description', type: 'textarea'},
]

export const valuesRules = {
  value: [
    {required: true, message: '请输入编码', trigger: 'blur'},
  ],
  cnName: [
    {required: true, message: '请输入中文名称', trigger: 'blur'},
  ],
  enName: [
    {required: true, message: '请输入英文名称', trigger: 'blur'},
  ],
}

export const valuesForm = [
  {label: '编码', key: 'value', type: 'text'},
  {label: '中文名称', key: 'cnName', type: 'text'},
  {label: '英文名称', key: 'enName', type: 'text'},
  {label: '业务含义', key: 'description', type: 'textarea'},
]
