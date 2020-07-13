<template>
  <div class="standard-audit-detail">
    <!-- 审核进度 -->
    <audit-step :info="stepData"></audit-step>
    <!-- 基本信息 -->
    <basic-info :info="basicData"></basic-info>
    <!-- 资源信息审核  -->
    <source-info v-if="data.auditStatus === 'AUDITING' && canAuditing" :info="sourceData"></source-info>
    <!-- 审批历史 -->
    <audit-history :info="auditHistory"></audit-history>
  </div>
</template>

<script>
  import runtimeArgs from '@/runtime-args'

  import AuditStep from '~/components/standard-audit/detail/audit-step'
  import BasicInfo from '~/components/standard-audit/detail/basic-info'
  import SourceInfo from '~/components/standard-audit/detail/source-info'
  import AuditHistory from '~/components/standard-audit/detail/audit-history'

  import {formatDate} from '~/utils/date'
  import {levelList} from '../essentials.data'
  import {DqsIssueOperateEnum,
          DsAuditStatus,
          basicListData,
          standardAuditAttribute,
          basicAuditContent,
          indexDescribeAttribute,
          indexBusinessAttribute,
          techPropertyAttribute,
          managerPropertyAttribute,
          statisticalAuditContent,
          organizationsAuditAttribute,
          organizationsAuditContent,
          commonCodeAuditAttribute,
          commonCodeAuditContent,
          DsAuditCheckStatus,
          fileCheckList} from '~/components/standard-audit/detail/data'
  import {DsStandardType, DsOperationType} from '~/components/standard-audit/list-panel-data'

  import QUERY_DS_AUDIT from '~/graphql/audit/ds-audit-query.gql'

  export default {
    components: {
      AuditStep,
      BasicInfo,
      SourceInfo,
      AuditHistory,
    },
    computed: {
      userData () {
        return this.$nuxt.$app.state.me
      },
      canAuditing () {
        let {permissionCodes} = this.userData
        permissionCodes = permissionCodes || []
        return permissionCodes.includes('dsAuditApproval')
      },
    },
    data () {
      return {
        id: null,
        data: {},
        auditHistory: [],
        stepData: {},
        basicData: [],
        sourceData: {},
        fileUploadUrl: runtimeArgs.NUXT_ENV_FILE_HTTP_ENDPOINT,
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      async init () {
        this.id = this.$route.params.id
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_AUDIT,
          fetchPolicy: 'network-only',
          variables: {
            id: this.id,
          },
        })
        let stepData = {
          statusLabel: DsAuditStatus[data.auditStatus],
          auditHistory: data.auditHistory,
        }
        data.contentObj = JSON.parse(data.content)
        this.data = data
        this.auditHistory = data.auditHistory
        this.stepData = stepData
        this.getBasicData()
        this.getSourceData()
      },
      getSourceData () {
        let statusLabel = DqsIssueOperateEnum[this.data.operation]
        let operation
        if (statusLabel) {
          operation = Object.values(DqsIssueOperateEnum).findIndex(x => x === statusLabel)
        }
        this.sourceData = {
          operation,
          opinion: this.data.opinion,
          userId: null,
        }
      },
      getBasicData () {
        const {standardType} = this.data
        let basicData = {
          ...this.data,
          standardTypeLabel: DsStandardType[standardType],
          typeLabel: DsOperationType[this.data.type],
        }

        basicData.creatorName = basicData.creator && basicData.creator.name
        // 基础标准时-执行
        if (standardType === 'STANDARD') {
          // 基本信息
          basicListData[standardType][0].list[0].list[0].map(x => {
            x.value = basicData[x.key]
          })
        }
        this.basicData = basicListData[standardType]
        this.getAuditContent()
      },
      // 组装 审批内容
      getAuditContent () {
        let {contentObj, standardType} = this.data
        if (contentObj === null) {
          this.basicData[1].list.forEach(x => { x.list = [] })
          return
        }
        // 添加容错
        const {file, fileName} = contentObj
        if (file) {
          const fileCard = {
            label: fileName,
            link: `${this.fileUploadUrl}fileDownload?ambryId=${file}`,
          }
          fileCheckList.list[0].forEach(x => {
            if (x.key === 'checkStatus') {
              x.value = DsAuditCheckStatus[contentObj[x.key]]
            } else {
              x.value = contentObj[x.key]
            }
          })
          this.basicData[1].list[0] = fileCard
          this.basicData[1].list[1] = fileCheckList
          return
        }

        this.basicData[1].list[0] = {}

        switch (standardType) {
          case 'STANDARD':
            this.assemlyBasicStandard()
            break
          case 'CODE':
            this.assemlyCommoncodeStandard()
            break
          case 'INSTITUTIONAL':
            this.assemlyOrganizationsStandard()
            break
          case 'STATISTICS':
            this.assemlyStatSpecsStandard()
            break
        }
      },

      // 组装-基础标准-审核内容-数据
      assemlyBasicStandard () {
        let {contentObj} = this.data
        this.basicData[1].list = basicAuditContent
        this.basicData[1].list[0].list[0].map(x => {
          if (x.key === 'auditStatus') {
            x.value = DsAuditStatus[contentObj[x.key]]
          } else if (x.key === 'modifier' || x.key === 'creator') {
            x.value = contentObj[x.key] && contentObj[x.key].name
          } else if (x.key === 'createTm' || x.key === 'modifyTm') {
            x.value = formatDate(contentObj[x.key])
          } else {
            x.value = contentObj[x.key]
          }
        })
        let {attributes} = contentObj
        attributes = attributes || []
        const attributeList = []
        attributes.map(attr => {
          standardAuditAttribute.map(x => {
            const {key} = x
            if (key === 'manager') {
              x.value = attr[key] && attr[key].name
            } else if (key === 'level') {
              x.value = levelList[attr[key]]
            } else {
              x.value = attr[key]
            }
          })
          attributeList.push(standardAuditAttribute)
        })
        this.basicData[1].list[1].list = attributeList
      },

      // 组装-指标标准-审核内容-数据
      assemlyStatSpecsStandard () {
        let {contentObj} = this.data
        this.basicData[1].list = statisticalAuditContent

        // 指标说明
        indexDescribeAttribute.map(x => {
          const {key} = x
          if (key === 'manager') {
            x.value = contentObj[key] && contentObj[key].name
          } else {
            x.value = contentObj[key]
          }
        })

        // 业务属性
        indexBusinessAttribute.map(x => {
          const {key} = x
          if (key === 'dimensions') {
            let value = ''
            if (contentObj[key] && contentObj[key].length) {
              value = contentObj[key][0].name
            }
            x.value = value
          } else if (key === 'statisticalTime') {
            x.value = formatDate(new Date(contentObj[key]))
          } else {
            x.value = contentObj[key]
          }
        })

        // 技术属性
        techPropertyAttribute.map(x => {
          const {key} = x
          if (key === 'dataSystem') {
            let value = ''
            if (contentObj['platformName'] && contentObj['systemName'] && contentObj['dbName']) {
              value = `${contentObj['platformName']}/${contentObj['systemName']}/${contentObj['dbName']}`
            }
            x.value = value
          } else {
            x.value = contentObj[key]
          }
        })

        // 管理属性
        managerPropertyAttribute.map(x => {
          const {key} = x
          if (key === 'presenter' || key === 'applyUser') {
            x.value = contentObj[key] && contentObj[key].name
          } else {
            x.value = contentObj[key]
          }
        })

        this.basicData[1].list[0].list = [indexDescribeAttribute]
        this.basicData[1].list[1].list = [indexBusinessAttribute]
        this.basicData[1].list[2].list = [techPropertyAttribute]
        this.basicData[1].list[3].list = [managerPropertyAttribute]
      },

      // 组装-机构清单-审核内容-数据
      assemlyOrganizationsStandard () {
        let {contentObj} = this.data
        this.basicData[1].list = organizationsAuditContent
        organizationsAuditAttribute.map(x => { x.value = contentObj[x.key] })
        this.basicData[1].list[0].list = [organizationsAuditAttribute]
      },

      // 组装-公共代码-审核内容-数据
      assemlyCommoncodeStandard () {
        let {contentObj} = this.data
        this.basicData[1].list = commonCodeAuditContent
        commonCodeAuditAttribute.map(x => { x.value = contentObj[x.key] })
        this.basicData[1].list[0].list = [commonCodeAuditAttribute]
      },
    },
  }
</script>

<style lang="scss">
  .standard-audit-detail {
    @apply flex-1;

    .standard-audit-card {
      &:first-of-type {
        margin-top: 0;

        .el-breadcrumb {
          line-height: 16px;
        }
      }
    }
  }
</style>
