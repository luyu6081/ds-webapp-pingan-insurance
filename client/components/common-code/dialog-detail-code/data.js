export const commonCodeValuesList = [
  {label: '中文名称', key: 'cnName', type: 'text'},
  {label: '英文名称', key: 'enName', type: 'text'},
  {label: '编码', key: 'value', type: 'text'},
  {label: '业务含义', key: 'description', type: 'textarea'},
]

export const commonCodeValuesRules = {
  cnName: [
    {required: true, message: '请输入中文名称', trigger: 'blur'},
  ],
  enName: [
    {required: true, message: '请输入英文名称', trigger: 'blur'},
  ],
  value: [
    {required: true, message: '请输入编码', trigger: 'blur'},
  ],
  number: [
    {required: true, message: '请输入编号', trigger: 'blur'},
  ],
  length: [
    {type: 'number', message: '必须为数字值', trigger: 'blur'},
  ],
}
