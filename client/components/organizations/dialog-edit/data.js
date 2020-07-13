export const organizationsList = [
  {label: '编号', key: 'number', type: 'text'},
  {label: '中文名称', key: 'cnName', type: 'text'},
  {label: '英文名称', key: 'enName', type: 'text'},
  {label: '英文缩写', key: 'enAbridge', type: 'text'},
  {label: '标准描述', key: 'description', type: 'textarea'},
]

export const organizationsRules = {
  number: [
    {required: true, message: '请输入编号', trigger: 'blur'},
  ],
  cnName: [
    {required: true, message: '请输入中文名称', trigger: 'blur'},
  ],
  enName: [
    {required: true, message: '请输入英文名称', trigger: 'blur'},
  ],
}
