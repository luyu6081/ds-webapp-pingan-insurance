<template>
  <!-- 审核进度 -->
  <standard-audit-card class="audit-history">
    <template #header>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="(item, index) in list"
                            :key="index"
                            :to="{ path: item.path }">{{ item.label }}</el-breadcrumb-item>
      </el-breadcrumb>
    </template>
    <!-- steps -->
    <ej-task-flow :data="taskFlowData" @nag="nag"></ej-task-flow>
  </standard-audit-card>
</template>

<script>

  import {
    Breadcrumb as ElBreadcrumb,
    BreadcrumbItem as ElBreadcrumbItem,
  } from 'element-ui'

  import {
    TaskFlow as EjTaskFlow,
  } from '@ej/ui'

  import StandardAuditCard from '~/components/standard-audit/card'

  import {IssueNodeStatus} from '~/components/standard-audit/detail/data'

  export default {
    props: {
      info: Object,
    },
    components: {
      ElBreadcrumb,
      ElBreadcrumbItem,
      StandardAuditCard,
      EjTaskFlow,
    },
    data () {
      return {
        IssueNodeStatus,
      }
    },
    computed: {
      taskFlowData () {
        let list = []
        //  type ['', 'disabled', '...', 'checked']
        const {auditHistory = []} = this.info
        auditHistory.map(x => {
          const {name, transact, endDate, durationInMillis} = x

          const item = {
            title: name,
            type: this.getTaskFlowStatus(x),
            tasks: [{
              user_img: transact.avatar,
              user_name: transact.name,
            }],
          }
          if (endDate) { item.tasks[0].timestamp = endDate }
          if (durationInMillis) { item.tasks[0].duration = durationInMillis }

          list.push(item)
        })
        return list
      },
      list () {
        const {id} = this.$route.params
        const {statusLabel} = this.info
        return [
          {
            label: '标准审核',
            path: '/standard-audit',
          },
          {
            label: statusLabel,
            path: '/standard-audit',
          },
          {
            label: this.$parent.data.name,
            path: `/standard-audit/${id}`,
          },
        ]
      },
    },
    methods: {
      nag (data) {
        console.log(data, 'nag')
      },
      getTaskFlowStatus (x) {
        const {handleStateEnum, operation} = x
        const {IssueNodeStatus} = this
        let str = ''
        if (handleStateEnum === IssueNodeStatus[0].value) {
          str = operation === 'REJECT' ? IssueNodeStatus[0].hatVal.reject : IssueNodeStatus[0].hatVal.pass
        } else {
          str = IssueNodeStatus.find(i => i.value === handleStateEnum).hatVal
        }
        return str
      },
    },
  }
</script>

<style lang="scss">
  .audit-history {
    .ej-flow-chart {
      margin-top: 24px;
    }
  }
</style>
