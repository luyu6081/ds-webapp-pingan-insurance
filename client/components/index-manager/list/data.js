import {DsAuditStatus, DsStandardStatus} from '~/components/standard-audit/detail/data'

export const COLUMNS = function () {
  return [
    {
      type: 'selection',
      width: 55,
    },
    {
      label: '中文名称',
      width: 200,
      render: (row) => {
        return ((h) => {
          return (
            <el-button type="text" onClick={(e) => this.onTableHandler(e, row, 'detail')}>{row.cnName}</el-button>
          )
        })(this.$createElement)
      },
    },
    {
      prop: 'enName',
      label: '英文名称',
      width: 180,
    },
    {
      prop: 'dimensions',
      label: '维度标签',
      render: (row) => {
        return ((h) => {
          return (
            <div>
              { (row.dimensions || []).map(x => {
                return <span>{x.name}</span>
              }) }
            </div>
          )
        })(this.$createElement)
      },
    },
    {
      prop: 'frequency',
      label: '上报频率',
    },
    {
      prop: 'modifyTm',
      label: '更新时间',
    },
    {
      label: '负责人',
      render: (row) => {
        return ((h) => {
          return (
            <div>
              { row.manager && row.manager.name }
            </div>
          )
        })(this.$createElement)
      },
    },
    {
      prop: 'status',
      label: '状态',
      render: (row) => {
        return ((h) => {
          return (
            <div>
              <span>{DsAuditStatus[row.auditStatus]}</span>
            </div>
          )
        })(this.$createElement)
      },
    },
    {
      label: '使用状态',
      render: (row) => {
        return ((h) => {
          return (
            <div>
              <span>{DsStandardStatus[row.status]}</span>
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
              <el-button type="text" onClick={(e) => this.onTableHandler(e, row, 'version')}>历史版本</el-button>
            </div>
          )
        })(this.$createElement)
      },
    },
  ]
}
