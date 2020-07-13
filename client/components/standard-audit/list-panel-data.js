import {DsAuditStatus, DsAuditCheckStatus} from '~/components/standard-audit/detail/data'

// 标准类型
export const DsStandardType = {
  STANDARD: '基础标准',
  CODE: '公共代码',
  INSTITUTIONAL: '机构清单',
  STATISTICS: '统计标准', // '统计标准',
}

// 操作类型
export const DsOperationType = {
  ADD: '添加',
  UPDATE: '编辑',
  DEL: '删除',
  IMPORT: '导入',
}

export const COLUMNS = function () {
  return [
    // {
    //   label: '申请ID',
    //   render: (row) => {
    //     return ((h) => {
    //       return (
    //         <el-button type="text" onClick={(e) => this.$router.push({path: `/standard-audit/${row.id}`})}>{row.id}</el-button>
    //       )
    //     })(this.$createElement)
    //   },
    // },
    {
      type: 'index',
      width: '50',
      label: '序号',
    },
    {
      // prop: 'name',
      label: '标准名称',
      render: (row) => {
        return ((h) => {
          return (
            <el-button type="text" onClick={(e) => this.$router.push({path: `/standard-audit/${row.id}`})}>{row.name}</el-button>
          )
        })(this.$createElement)
      },
    },
    {
      label: '标准类型',
      render: (row) => {
        return ((h) => {
          return (
            <span>{DsStandardType[row.standardType]}</span>
          )
        })(this.$createElement)
      },
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
      label: '变更类型',
      render: (row) => {
        const className = `status-type ${row.type}`
        return ((h) => {
          return (
            <span class={className}>{DsOperationType[row.type]}</span>
          )
        })(this.$createElement)
      },
    },
    {
      label: '校验状态',
      render: (row) => {
        return ((h) => {
          return (
            <span>{DsAuditCheckStatus[row.checkStatus]}</span>
          )
        })(this.$createElement)
      },
    },
    {
      prop: 'project',
      label: '项目',
    },
  ]
}

// 待审核
export const TODO_COLUMNS = function () {
  return [
    {
      label: '操作',
      width: 100,
      render: (row) => {
        return ((h) => {
          return (
            <el-button type="text" onClick={(e) => this.onRowClick(e, row, 'pass')}>通过</el-button>
          )
        })(this.$createElement)
      },
    },
  ]
}

// 与我相关
export const RELATED_COLUMNS = function () {
  return [
    {
      label: '审批状态',
      render: (row) => {
        return ((h) => {
          return (
            <span>{DsAuditStatus[row.auditStatus]}</span>
          )
        })(this.$createElement)
      },
    },
  ]
}

// 已完成
export const CLOSED_COLUMNS = function () {
  return [
    {
      label: '审批结果',
      render: (row) => {
        return ((h) => {
          return (
            <span >{DsAuditStatus[row.auditStatus]}</span>
          )
        })(this.$createElement)
      },
    },
  ]
}
