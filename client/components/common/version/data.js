export const COLUMNS = function () {
  return [
    {
      type: 'index',
      width: '50',
      label: '序号',
    },
    {
      prop: 'version',
      label: '版本号',
    },
    {
      prop: 'name',
      label: '标准名称',
    },
    {
      label: '提交人',
      render: (row) => {
        return ((h) => {
          return (
            <span>{row.creator && row.creator.name}</span>
          )
        })(this.$createElement)
      },
    },
    {
      label: '审批人',
      render: (row) => {
        return ((h) => {
          return (
            <span>{row.approver && row.approver.name}</span>
          )
        })(this.$createElement)
      },
    },
    {
      prop: 'createTm',
      label: '日期',
    },
    {
      label: '操作',
      render: (row) => {
        return ((h) => {
          return (
            <el-button type="text" onClick={(e) => this.onTableHandler(e, row, 'detail')}>查看</el-button>
          )
        })(this.$createElement)
      },
    },
  ]
}
