<template>
  <!-- 审批历史 -->
  <standard-audit-card class="audit-history">
    <template #header>
      审批历史
    </template>
    <audit-history v-if="historyList.length" :options="historyList">
      <template #attachment="{options, content}">
        <attach-slot v-if="content || (options || []).length" :options="options" :content="content"/>
        <span v-else class="ml-3 tip">暂无</span>
      </template>
    </audit-history>

    <no-data v-if="!historyList.length"></no-data>

  </standard-audit-card>
</template>

<script>
  import StandardAuditCard from '~/components/standard-audit/card'
  import AuditHistory from '~/components/common/history-task/audit-history'
  import AttachSlot from '~/components/common/history-task/attach-slot'
  import NoData from '~/components/common/no-data'

  import {IssueNodeStatus} from '~/components/standard-audit/detail/data'

  import {toImgHref} from '~/utils/tools'

  export default {
    props: {
      info: {
        type: Array,
        default: () => [],
      },
    },
    components: {
      StandardAuditCard,
      AuditHistory,
      AttachSlot,
      NoData,
    },
    computed: {
      historyList () {
        let list = []
        this.info.map(x => {
          const {name, transact, endDate, durationInMillis, opinion, files, handleStateEnum} = x

          if (handleStateEnum === IssueNodeStatus[0].value) {
            let item = {
              title: name,
              name: transact && transact.name,
              img: toImgHref(transact && transact.avatar),
              timestamp: endDate,
              duration: durationInMillis,
              content: opinion,
              attachment: files,
            }
            list.push(item)
          }
        })
        return list
      },
    },
    data () {
      return {
        IssueNodeStatus,
      }
    },
  }
</script>

<style lang="scss">
  .audit-history {
    .no-data {
      min-height: 200px;
      position: relative;
    }
  }
</style>
