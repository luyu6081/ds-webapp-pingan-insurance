<template>
  <div class="index-manager-detail" v-ej-loading.fullscreen="loading">
    <div class="index-manager-detail__header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="(item, index) in menuList"
                            :key="index"
                            :to="{ path: item.path }">{{ item.label }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="index-manager-detail__content">
      <el-timeline>
        <el-timeline-item timestamp="指标说明" placement="top">
          <common-form ref="form" :rules="indexDescribeValuesRules" :list="indexDescribeValuesList" :form="descriptForm" :label-width="labelWidth"></common-form>
        </el-timeline-item>
        <el-timeline-item timestamp="业务属性" placement="top">
          <common-form :list="indexBusinessValuesList" :form="businessForm" :label-width="labelWidth"></common-form>
        </el-timeline-item>
        <el-timeline-item timestamp="技术属性" placement="top">
          <common-form ref="techForm" :list="techPropertyValuesList" :form="techPropertyForm" :label-width="labelWidth"></common-form>
        </el-timeline-item>
        <el-timeline-item timestamp="管理属性" placement="top">
          <common-form :list="managerPropertyValuesList" :form="managerPropertyForm" :label-width="labelWidth"></common-form>
        </el-timeline-item>
        <el-timeline-item timestamp="指标映射" placement="top">
          <ej-search-input v-model="keyWord"
                       width="180px"
                       height="34"
                       placeholder="请输入搜索条件"
                       @search="getMappingData"/>
          <common-table :list="mappingList" :columns="columns"></common-table>
          <busi-buttons :disabled="disabled" :show-button="['new']" @click="onMapDialogShow"/>
        </el-timeline-item>
      </el-timeline>

      <div class="btn-bar-group">
        <el-button @click="onCancel">取消</el-button>
        <el-button @click="onSave">保存</el-button>
        <el-button type="primary" @click="onSubmit">提交</el-button>
      </div>
    </div>
    <!-- 弹窗提示 -->
    <dialog-message-box :visible.sync="messageBoxVisible"
                        :info="messageBoxData"></dialog-message-box>
    <!-- 映射弹窗 -->
    <dialog-mapping title="信息项标准映射"
                    :visible.sync="mappingVisible" :info="mappingForm"></dialog-mapping>
  </div>
</template>

<script>

  import {
    Breadcrumb as ElBreadcrumb,
    BreadcrumbItem as ElBreadcrumbItem,
    Button as ElButton,
    Timeline as ElTimeline,
    TimelineItem as ElTimelineItem,
  } from 'element-ui'

  import {
    SearchInput as EjSearchInput,
  } from '@ej/ui'

  import MUTATION_DS_SAVE_STATISTICAL from '~/graphql/index-manager/ds-save-statistical-mutation.gql'
  import MUTATION_DS_SUBMIT_AUDIT from '~/graphql/audit/ds-submit-audit-mutation.gql'
  import QUERY_ORGANIZATION_LIST from '~/graphql/index-manager/organization_list_nopagination.gql'
  import QUERY_DS_DIMENSIONS from '~/graphql/index-manager/ds-dimensions-query.gql'
  import QUERY_AUTH_NAME_CARD_LIST from '~/graphql/user/auth-name-card-query.gql'
  import QUERY_DS_STATISTICAL from '~/graphql/index-manager/ds-statistical-query.gql'
  import QUERY_DS_STATISTICAL_MAPPINGS from '~/graphql/statisticals/ds-statistical-mappings-query.gql'
  import QUERY_MDS_SEARCH from '~/graphql/essentials/mds-search-query.gql'
  import QUERY_MDS_LOAD_MDS_OBJECT from '~/graphql/essentials/mds-load-mds-object-query.gql'
  import QUERY_DS_STATISTICAL_MAPPING from '~/graphql/statisticals/ds-statistical-mapping-query.gql'
  import MUTATION_DS_DEL_STATISTICALL_MAPPING from '~/graphql/statisticals/ds-del-statisticall-mapping-mutation.gql'

  import {mapActions, mapGetters} from 'vuex'
  import MessageBoxMixins from '~/mixins/message-box'

  import {indexDescribeValuesList, indexDescribeValuesRules, indexBusinessValuesList, techPropertyValuesList, managerPropertyValuesList, COLUMNS} from '~/components/index-manager/detail/form'
  import CommonForm from '~/components/common/form'
  import CommonTable from '~/components/common/table'
  import DialogMessageBox from '~/components/common/message-box'
  import DialogMapping from '~/components/essentials/dialog-mapping'
  import BusiButtons from '~/components/busiButtons'

  export default {
    mixins: [MessageBoxMixins],
    components: {
      ElBreadcrumb,
      ElBreadcrumbItem,
      ElButton,
      ElTimeline,
      ElTimelineItem,
      CommonForm,
      CommonTable,
      DialogMapping,
      BusiButtons,
      DialogMessageBox,
      EjSearchInput,
    },
    computed: {
      ...mapGetters({
        userList: 'user/userList',
        techTree: 'techTree',
      }),
      loading () {
        return this.loadingCount !== 0
      },
      disabled () {
        return this.id === '-1'
      },
    },
    data () {
      return {
        type: 'STATISTICS',
        id: null,
        indexId: null,
        mappingVisible: false,
        mappingForm: {},
        menuList: [],
        loadingCount: 0,
        labelWidth: 130,
        indexDescribeValuesList,
        indexDescribeValuesRules,
        indexBusinessValuesList,
        techPropertyValuesList,
        managerPropertyValuesList,
        descriptForm: {},
        businessForm: {},
        techPropertyForm: {},
        managerPropertyForm: {},
        keyWord: '',
        columns: [],
        mappingList: [],
        organizationList: [], // 数据管理部门
        dimensions: [],
        providerOrganizationList: [], // 数据需求提出部门
        applyDepartmentList: [], // 数据使用部门
        presenterList: [], // 数据需求提出者
        applyUserList: [], // 数据使用者
        techTypeLabels: [],
        isInitDetailInfo: false,
      }
    },
    mounted () {
      this.categoriesTechList()
      this.initData()
    },
    methods: {
      ...mapActions({
        'getUserList': 'user/getUserList',
        categoriesTechList: 'categoriesTechList',
      }),
      async initData () {
        let {$route: {params: {id, indexId}}} = this
        this.id = id
        this.indexId = indexId
        const obj = {
          new: '新建',
          edit: '编辑',
        }
        let type = 'edit'
        if (id === '-1') { type = 'new' }
        const menuList = [
          {path: '/index-manager-list', label: '统计标准'},
          {path: '', label: `${obj[type]}统计标准`},
        ]
        this.menuList = menuList
        // 初始化form select组件
        await this.initFormSelection()
        // 编辑获取数据
        if (this.id !== '-1') {
          this.getDetail()
          this.getMappingData()
        }
        this.columns = COLUMNS.bind(this)()
      },
      async getMappingData () {
        const {id, keyWord} = this
        this.loadingCount++
        let {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_STATISTICAL_MAPPINGS,
          fetchPolicy: 'network-only',
          variables: {
            statisticalId: id,
            keyWord,
          },
        })
        this.loadingCount--
        this.mappingList = data || []
        this.columns = COLUMNS.bind(this)()
      },
      async getDetail () {
        try {
          this.loadingCount++
          let {data: {data}} = await this.$apollo.query({
            query: QUERY_DS_STATISTICAL,
            fetchPolicy: 'network-only',
            variables: {
              id: this.id,
            },
          })
          const descriptFormKeys = this.indexDescribeValuesList.map(x => x.key)
          const businessFormKeys = this.indexBusinessValuesList.map(x => x.key)
          const techPropertyFormKeys = this.techPropertyValuesList.map(x => x.key)
          const managerPropertyFormKeys = this.managerPropertyValuesList.map(x => x.key)
          const descriptForm = {}
          const businessForm = {}
          const techPropertyForm = {}
          const managerPropertyForm = {}
          this.isInitDetailInfo = true
          descriptFormKeys.map(x => {
            if (x === 'managerId') {
              descriptForm[x] = data.manager && data.manager.id
            } else {
              descriptForm[x] = data[x]
            }
          })
          this.descriptForm = descriptForm
          businessFormKeys.map(x => {
            if (x === 'dimensionIds') {
              businessForm[x] = data.dimensions && data.dimensions[0].id
            } else if (x === 'statisticalTime') {
              businessForm[x] = new Date(Number(data.statisticalTime))
            } else {
              businessForm[x] = data[x]
            }
          })
          this.businessForm = businessForm
          techPropertyFormKeys.map(x => {
            if (x === 'dataSystem') {
              techPropertyForm[x] = [data.platformId, data.systemId, data.dbId]
            } else {
              techPropertyForm[x] = data[x]
            }
          })
          this.techPropertyForm = techPropertyForm
          managerPropertyFormKeys.map(x => {
            if (x === 'presenterId') {
              managerPropertyForm[x] = data.presenter && data.presenter.id
            } else if (x === 'applyUserId') {
              managerPropertyForm[x] = data.applyUser && data.applyUser.id
            } else {
              managerPropertyForm[x] = data[x]
            }
          })
          this.managerPropertyForm = managerPropertyForm
          setTimeout(() => {
            this.isInitDetailInfo = false
          }, 0)
        } finally {
          this.loadingCount--
        }
      },
      // 获取数据管理部门数据
      async getOrganizationDataList (keyWords) {
        let input = {
          organizationId: '',
          keyWords,
          order: true,
        }
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_ORGANIZATION_LIST,
          fetchPolicy: 'no-cache',
          client: 'auth',
          variables: {
            input,
          },
        })
        return data || []
      },
      // 数据管理部门
      async getOrganizationList (keyWords) {
        this.organizationList = await this.getOrganizationDataList(keyWords)
      },
      async getApplyDepartmentList (keyWords) {
        this.applyDepartmentList = await this.getOrganizationDataList(keyWords)
      },
      async getProviderOrganizationList (keyWords) {
        this.providerOrganizationList = await this.getOrganizationDataList(keyWords)
      },
      // 获取用户数据
      async getUserDataList (keyWords) {
        let input = {keyWords}
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_AUTH_NAME_CARD_LIST,
          fetchPolicy: 'no-cache',
          client: 'auth',
          variables: {
            input,
          },
        })
        return data || []
      },
      // 数据需求提出者
      async getPresenterList (keyWords) {
        this.presenterList = await this.getUserDataList(keyWords)
      },
      // 数据使用者
      async getApplyUserList (keyWords) {
        this.applyUserList = await this.getUserDataList(keyWords)
      },
      // 请选择平台/系统/库
      handleChange (val) {
        // 清空表，字段值
        if (!this.isInitDetailInfo) { // 非初始化清空
          this.techPropertyForm.dataTableId = ''
          this.techPropertyForm.dataColumnId = ''
        }
        if (val.length !== 3) {
          this.$message.error('请选择（平台/系统/库）')
          return
        }
        this.techTypeLabels = this.$refs['techForm'].$refs['ruleForm'].$children[1].$children[1].getCheckedNodes()[0].pathLabels
      },
      async initFormSelection () {
        // 指标说明
        await this.getOrganizationList()
        // 管理员
        await this.getUserList()
        // 指标维度
        await this.getDimensions()
        // 数据需求提出部门
        await this.getProviderOrganizationList()
        // 数据使用部门
        await this.getApplyDepartmentList()
        // 数据需求提出者
        await this.getPresenterList()
        // 数据使用者
        await this.getApplyUserList()

        this.indexDescribeValuesList.forEach(x => {
          if (x.label === '数据管理部门') {
            if (x.attrs.remote) {
              x.attrs.remoteMethod = this.getOrganizationList
            }
          } else if (x.label === '数据管理者') {
            if (x.attrs.remote) {
              x.attrs.remoteMethod = this.getUserList
            }
          }
        })
        // 业务属性
        this.indexBusinessValuesList.forEach(x => {
          if (x.label === '指标维度') {
            if (x.attrs.remote) {
              x.attrs.remoteMethod = this.getDimensions
            }
          }
        })
        // 技术属性
        this.techPropertyValuesList.forEach(x => {
          if (x.label === '数据源系统') {
            x.options = this.techTree
            x.handleChange = this.handleChange
            x.attrs.props = {'value': 'id', 'label': 'name'}
          } else if (x.label === '数据源表名称') {
            if (x.attrs.remote) {
              x.attrs.remoteMethod = this.mdsSearch
            }
          } else if (x.label === '数据源字段名称') {
            if (x.attrs.remote) {
              x.attrs.remoteMethod = this.getUserList
            }
          }
        })
        // 管理属性
        this.managerPropertyValuesList.forEach(x => {
          if (x.label === '数据需求提出部门') {
            if (x.attrs.remote) {
              x.attrs.remoteMethod = this.getProviderOrganizationList
            }
          } else if (x.label === '数据需求提出者') {
            if (x.attrs.remote) {
              x.attrs.remoteMethod = this.getPresenterList
            }
          } else if (x.label === '数据使用部门') {
            if (x.attrs.remote) {
              x.attrs.remoteMethod = this.getApplyDepartmentList
            }
          } else if (x.label === '数据使用者') {
            if (x.attrs.remote) {
              x.attrs.remoteMethod = this.getApplyUserList
            }
          }
        })
      },

      // 字段
      async mdsLoadMdsObject () {
        const variables = {
          mdsObjectId: this.techPropertyForm.dataTableId,
        }
        let {data: {data}} = await this.$apollo.query({
          query: QUERY_MDS_LOAD_MDS_OBJECT,
          fetchPolicy: 'network-only',
          variables,
        })
        let {mdsColumns} = data
        mdsColumns = mdsColumns || []
        let list = []
        mdsColumns.map(x => {
          const {id, name} = x
          list.push({
            value: id,
            label: name,
          })
        })
        const item = this.techPropertyValuesList.filter(x => x.label === '数据源字段名称')[0]
        item.options = list
      },

      // 表
      async mdsSearch (keyword) {
        const {dataSystem} = this.techPropertyForm
        if (dataSystem === undefined || dataSystem.length !== 3) {
          this.$message.error('请选择（平台/系统/库）')
          return
        }
        let techCategoryId = dataSystem[2]
        const input = {
          techCategoryId,
          offset: 0,
          size: 9999999,
        }
        if (keyword) {
          input.keyword = keyword
        }
        let {data: {data: {data}}} = await this.$apollo.query({
          query: QUERY_MDS_SEARCH,
          fetchPolicy: 'network-only',
          variables: {
            input,
          },
        })
        data = data || []
        let list = []
        data.map(x => {
          const {id, name} = x
          list.push({
            value: id,
            label: name.replace(/\<\/?em\>/gi, ''), // eslint-disable-line
          })
        })
        const item = this.techPropertyValuesList.filter(x => x.label === '数据源表名称')[0]
        item.options = list
      },
      // 获取所有维度标签
      async getDimensions () {
        try {
          this.loadingCount++
          const {data: {data}} = await this.$apollo.query({
            query: QUERY_DS_DIMENSIONS,
            fetchPolicy: 'no-cache',
          })
          this.dimensions = data.map(x => {
            return {value: x.id, label: x.name}
          })
        } finally {
          this.loadingCount--
        }
      },
      onTableHandler (e, row, type) {
        const {id} = row
        switch (type) {
          case 'edit':
            this.getStatisticallMapping(id)
            break
          case 'delete':
            this.onDeleteStatisticallMapping(id)
            break
        }
      },
      onDeleteStatisticallMapping (id) {
        this.loadingCount++
        this.$apollo.mutate({
          mutation: MUTATION_DS_DEL_STATISTICALL_MAPPING,
          variables: {
            id,
          },
          update: (store, {data: {data}}) => {
            this.loadingCount--
            if (data) {
              this.$message.success('保存成功！')
              // 信息项
              this.getMappingData()
            }
          },
        }).catch(e => {
          this.loadingCount--
        })
      },
      async getStatisticallMapping (id) {
        this.loadingCount++
        let {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_STATISTICAL_MAPPING,
          fetchPolicy: 'network-only',
          variables: {
            id,
          },
        })
        this.loadingCount--
        this.onMapDialogShow('edit', data)
      },
      onMapDialogShow (type, mappingForm = {}) {
        this.mappingVisible = true
        this.mappingForm = mappingForm
      },
      onCancel () {
        this.showMessageBox({
          title: this.menuList[1].label,
          content: '确定要退出当前页面吗？',
          confirm: () => {
            this.$router.push({path: '/index-manager-list'})
          },
        })
      },
      async getFormData () {
        const $form = this.$refs['form']
        await $form.onSubmit()
        if (!$form.validate) {
          this.$message.error('必填项不能为空！')
          return
        }
        // 提交表单
        const {cnName, enName, manageDepartmentId, managerId} = this.descriptForm
        const {definition, rule, reference, unit, frequency, arrangement, mappingType, processingLogic, statisticalTime, dimensionIds} = this.businessForm
        const {dataType, dataSystem, dataTableId, dataColumnId} = this.techPropertyForm
        const {codeRule, proposeDepartmentId, presenterId, applyDepartmentId, applyUserId} = this.managerPropertyForm
        const selMgrDep = this.indexDescribeValuesList.filter(x => x.organizationId === manageDepartmentId)[0] || {}
        const selPropsDep = this.providerOrganizationList.filter(x => x.organizationId === proposeDepartmentId)[0] || {}
        const selAppDep = this.applyDepartmentList.filter(x => x.organizationId === applyDepartmentId)[0] || {}
        let formData = {
          // # 指标说明
          indexId: this.indexId,
          cnName,
          enName,
          manageDepartmentId,
          managerId,
          // # 业务属性
          definition,
          rule,
          reference,
          unit,
          frequency,
          arrangement,
          mappingType,
          processingLogic,
          dimensionIds,
          // # 技术属性
          dataType,
          // # 管理属性
          codeRule,
          proposeDepartmentId,
          presenterId,
          applyDepartmentId,
        }

        if (this.id !== '-1') {
          formData.id = this.id
        }
        if (statisticalTime) {
          formData.statisticalTime = statisticalTime.getTime()
        }
        if (selMgrDep.organizationId) {
          formData.manageDepartmentName = selMgrDep.organizationName
        }
        if (selPropsDep.organizationId) {
          formData.proposeDepartmentName = selPropsDep.organizationName
        }
        if (selAppDep.organizationId) {
          formData.applyDepartmentName = selAppDep.organizationName
        }
        if (applyUserId) {
          formData.applyUserId = applyUserId
        }
        if (dataSystem && dataSystem.length === 3) {
          formData.platformName = this.techTypeLabels[0]
          formData.platformId = dataSystem[0]
          formData.systemName = this.techTypeLabels[1]
          formData.systemId = dataSystem[1]
          formData.dbName = this.techTypeLabels[2]
          formData.dbId = dataSystem[2]
        }
        if (dataTableId) {
          formData.dataTableId = dataTableId
        }
        if (dataColumnId) {
          formData.dataColumnId = dataColumnId
        }
        return formData
      },
      async onSave (cb) {
        let input = await this.getFormData()
        if (input === undefined) return
        this.$apollo.mutate({
          mutation: MUTATION_DS_SAVE_STATISTICAL,
          variables: {
            input,
          },
          update: (store, {data: {data}}) => {
            if (data) { // 保存成功
              // 提交审核
              if (typeof cb === 'function') {
                let params = {
                  title: input.cnName,
                  type: this.type, // 指标
                  id: data,
                  operation: input.id ? 'UPDATE' : 'ADD',
                }
                cb(params)
              } else {
                this.$message.success('保存成功！')
                this.$router.push({path: '/index-manager-list'})
              }
            } else {
              this.$message.error('保存失败！')
            }
          },
        })
      },
      onSubmitAudit (params) {
        this.$apollo.mutate({
          mutation: MUTATION_DS_SUBMIT_AUDIT,
          variables: {
            ...params,
          },
          update: (store, {data: {data}}) => {
            if (data) {
              this.$message.success('提交成功！')
            } else {
              this.$message.success('提交失败！')
            }
          },
        })
      },
      onSubmit () {
        let cb = this.onSubmitAudit
        this.onSave(cb)
      },
    },
    watch: {
      'techPropertyForm.dataSystem' (val) {
        if (val.length === 3) {
          this.mdsSearch()
        }
      },
      'techPropertyForm.dataTableId' (val) {
        if (!this.isInitDetailInfo) {
          this.techPropertyForm.dataColumnId = ''
        }
        if (val) {
          this.mdsLoadMdsObject()
        }
      },
      dimensions: {
        handler (newVal) {
          const item = this.indexBusinessValuesList.filter(x => x.key === 'dimensionIds')[0]
          item.options = newVal
        },
        immediate: true,
        deep: true,
      },
      presenterList: { // 数据需求提出者
        handler (newVal) {
          const item = this.managerPropertyValuesList.filter(x => x.key === 'presenterId')[0]
          item.options = newVal.map(x => {
            return {label: x.name, value: x.userId}
          })
        },
        immediate: true,
        deep: true,
      },
      applyUserList: { // 数据使用者
        handler (newVal) {
          const item = this.managerPropertyValuesList.filter(x => x.key === 'applyUserId')[0]
          item.options = newVal.map(x => {
            return {label: x.name, value: x.userId}
          })
        },
        immediate: true,
        deep: true,
      },
      userList: {
        handler (newVal) {
          const item = this.indexDescribeValuesList.filter(x => x.key === 'managerId')[0]
          item.options = newVal
        },
        immediate: true,
        deep: true,
      },
      applyDepartmentList: {
        handler (newVal) {
          const item = this.managerPropertyValuesList.filter(x => x.key === 'applyDepartmentId')[0]
          item.options = newVal.map(x => {
            return {label: x.organizationName, value: x.organizationId}
          })
        },
        immediate: true,
        deep: true,
      },
      providerOrganizationList: {
        handler (newVal) {
          const item = this.managerPropertyValuesList.filter(x => x.key === 'proposeDepartmentId')[0]
          item.options = newVal.map(x => {
            return {label: x.organizationName, value: x.organizationId}
          })
        },
        immediate: true,
        deep: true,
      },
      organizationList: {
        handler (newVal) {
          const item = this.indexDescribeValuesList.filter(x => x.key === 'manageDepartmentId')[0]
          item.options = newVal.map(x => {
            return {label: x.organizationName, value: x.organizationId}
          })
        },
        immediate: true,
        deep: true,
      },
    },
  }
</script>

<style lang="scss">
  .index-manager-detail {
    @apply bg-white;

    &__header {
       @apply text-gray-darkest;

      line-height: 50px;
      height: 50px;
      background-color: #f4f7fe;
      padding-left: 24px;

      .common-buttons {
        float: right;
        margin-right: 24px;
      }
    }

    &__content {
      @apply text-gray-darkest flex-1 flex flex-col;

      padding: 20px 24px 20px 34px;
      box-sizing: border-box;
      font-size: 14px;

      .el-form {
        .el-form-item {
          flex-basis: 25%;
        }
      }

      .common-buttons {
        width: 100%;
        text-align: center;
      }

      .btn-bar-group {
        margin-top: 84px;
        text-align: center;
      }
    }
  }
</style>
