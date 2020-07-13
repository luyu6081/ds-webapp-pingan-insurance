<template>
  <div class="cc-map-create" v-ej-loading.fullscreen="loading">
    <div class="cc-map-create__header">
      <el-breadcrumb separator="/" class="float-left">
        <el-breadcrumb-item>标准内容</el-breadcrumb-item>
        <el-breadcrumb-item :to="{name: 'common-codes'}">公共代码列表</el-breadcrumb-item>
        <el-breadcrumb-item>{{cnName}}</el-breadcrumb-item>
        <el-breadcrumb-item>系统映射</el-breadcrumb-item>
        <el-breadcrumb-item>{{ title }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="cc-map-create__content">
      <detail-map-card title="映射对象">
        <el-form ref="form"
                :rules="rules"
                :model="form"
                label-width="100px">
          <el-form-item label="表：" prop="techType">
            <el-cascader :options="techTree"
                      :props="cascaderProps"
                      placeholder="请选择（平台/系统/库）"
                      v-model="form.techType"
                      @change="handleTechTypeChange"
                      ref="techTree"></el-cascader>
          </el-form-item>
          <el-form-item label="字段：" prop="tableColumns">
            <mapping ref="tableColumns" v-model="form.tableColumns" :list="form.techType" :card-list="tableColumns" @mapToggleBefore="onMapToggleBefore"></mapping>
          </el-form-item>
          <el-form-item label="检查规则：" prop="checkList">
            <mapping ref="checkList" v-model="form.checkList" :list="form.techType" :card-list="checkList" @mapToggleBefore="onMapToggleBefore"></mapping>
          </el-form-item>
        </el-form>
      </detail-map-card>
      <detail-map-card title="映射值">
        <common-table :list="list" :columns="columns"></common-table>
        <busi-buttons :show-button="['new']" @click="onAddValuesItem" />
      </detail-map-card>

      <div class="btn-group">
        <el-button @click="onCancel">取消</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </div>
    </div>

    <!-- 弹窗提示 -->
    <dialog-message-box :visible.sync="messageBoxVisible"
                        :info="messageBoxData"></dialog-message-box>
  </div>
</template>

<script>

  import {
    Breadcrumb as ElBreadcrumb,
    BreadcrumbItem as ElBreadcrumbItem,
    Button as ElButton,
    Cascader as ElCascader,
    Form as ElForm,
    FormItem as ElFormItem,
    Select as ElSelect,
    Option as ElOption,
    Input as ElInput,
  } from 'element-ui'

  import {mapGetters, mapActions} from 'vuex'

  import MUTATION_DS_DEL_COMMON_CODE_VALUE_MAPPING from '~/graphql/common-code/ds-del-common-code-value-mapping-mutation.gql'
  import MUTATION_DS_SAVE_COMMON_CODE_VALUE_MAPPING from '~/graphql/common-code/ds-save-common-code-mapping-mutation.gql'
  import QUERY_DS_COMMON_CODE_VALUES from '~/graphql/common-code/ds-common-code-values-query.gql'
  import QUERY_DS_COMMON_CODE_MAPPING from '~/graphql/common-code/ds-common-code-mapping-query.gql'

  import DetailMapCard from '~/components/common-code/detail-map-create/card'
  import CommonTable from '~/components/common/table'
  import BusiButtons from '~/components/busiButtons'
  import DialogMessageBox from '~/components/common/message-box'
  import Mapping from '~/components/essentials/map'
  import MessageBoxMixins from '~/mixins/message-box'

  import {COLUMNS} from '~/components/common-code/detail-map-create/data'

  export default {
    mixins: [MessageBoxMixins],
    components: {
      ElBreadcrumb,
      ElBreadcrumbItem,
      ElButton,
      ElCascader,
      ElForm,
      ElFormItem,
      DetailMapCard,
      CommonTable,
      BusiButtons,
      DialogMessageBox,
      Mapping,
      ElSelect, // eslint-disable-line
      ElOption, // eslint-disable-line
      ElInput, // eslint-disable-line
    },
    computed: {
      ...mapGetters({
        techTree: 'techTree',
      }),
      title () {
        let label = '新建'
        if (this.id) label = '编辑'
        return `${label}映射`
      },
      loading () {
        return this.loadingCount !== 0
      },
    },
    data () {
      return {
        cascaderProps: {
          label: 'name',
          value: 'id',
        },
        codeId: null,
        id: null,
        cnName: null,
        tableColumns: [
          {
            title: '表',
            list: [],
          },
          {
            title: '字段',
            list: [],
            width: 60,
          },
        ],
        checkList: [
          {
            title: '检查规则',
            list: [],
          },
        ],
        rules: {
          techType: [
            {type: 'array', required: true, message: '请选择（平台/系统/库）', trigger: 'change'},
          ],
          tableColumns: [
            {type: 'array', required: true, message: '请选择字段', trigger: 'blur'},
          ],
          checkList: [
            {type: 'array', required: true, message: '请选择检查规则', trigger: 'blur'},
          ],
        },
        form: {
          techType: [],
          tableColumns: [], // 表，字段
          checkList: [], // 检查规则
          techTypeLabels: [],
        },
        list: [],
        rowItem: {
          id: null,
          codeMappingId: null,
          codeValueId: null,
          code: null,
          value: null,
          isEdit: true,
        },
        columns: [],
        values: [],
        loadingCount: 0,
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      ...mapActions({
        categoriesTechList: 'categoriesTechList',
      }),
      async init () {
        this.categoriesTechList()
        const {codeId, id, cnName} = this.$route.query
        this.codeId = codeId
        this.id = id
        this.cnName = cnName
        this.columns = COLUMNS.bind(this)()
        await this.getCommonCodeValues()
        if (this.id) {
          this.getMapDetail()
        }
      },
      onCancel () {
        this.$router.go(-1)
      },
      async getMapDetail () {
        if (!this.id) return
        this.loadingCount++
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_COMMON_CODE_MAPPING,
          fetchPolicy: 'network-only',
          variables: {
            id: this.id,
          },
        })
        this.loadingCount--
        let {tableId, tableName, fieldId, fieldName, ruleIds, ruleNames, platformId, systemId, dbId, codeValueMappings} = data || {}
        const tableColumns = []
        const techTypeLabels = []
        let checkList = []
        let techType = []
        codeValueMappings = codeValueMappings || []
        if (platformId && systemId && dbId) {
          techType = [platformId, systemId, dbId]
        }
        if (tableId && tableName) {
          tableColumns[0] = {id: tableId, name: tableName}
        }
        if (fieldId && fieldName) {
          tableColumns[1] = {id: fieldId, name: fieldName}
        }
        if (ruleIds && ruleNames) {
          checkList = ruleIds.map((x, i) => ({id: x, name: ruleNames[i]}))
        }
        this.form = {
          techType,
          tableColumns,
          checkList,
          techTypeLabels,
        }
        this.tableColumns.forEach(x => { x.list = [] })
        this.checkList.forEach(x => { x.list = [] })
        if (platformId) {
          this.$nextTick(() => {
            this.handleTechTypeChange()
          })
        }
        codeValueMappings.forEach(x => {
          x.isEdit = false
        })
        this.list = codeValueMappings || []
      },
      async onSave () {
        const $form = this.$refs['form']
        let validate
        try {
          validate = await $form.validate()
        } catch (e) {
          if (!validate) {
            this.$message.error('必填项不能为空！')
            return
          }
        }
        if (this.form.techType.length < 3) {
          this.$message.error('请选择（平台/系统/库）')
          return
        }
        const nullLen = this.list.filter(x => x.codeValueId === null).length
        if (nullLen || !this.list.length) {
          this.$message.error('请选择映射值')
          return
        }

        if (validate) { // 提交表单
          const {
            form: {
              techType,
              tableColumns,
              checkList,
              techTypeLabels,
            },
            codeId,
            id,
          } = this
          const codeValueMappings = this.list.map(x => {
            const {id, codeValueId, code, value} = x
            const item = {
              codeValueId,
              code,
              value,
            }
            if (id) item.id = id
            if (this.id) item.codeMappingId = this.id
            return item
          })

          const input = {
            codeId,
            platformName: techTypeLabels[0],
            platformId: techType[0],
            systemName: techTypeLabels[1],
            systemId: techType[1],
            dbName: techTypeLabels[2],
            dbId: techType[2],
            tableName: tableColumns[0].name,
            tableId: tableColumns[0].id,
            fieldName: tableColumns[1].name,
            fieldId: tableColumns[1].id,
            ruleNames: checkList.map(x => x.name),
            ruleIds: checkList.map(x => x.id),
            codeValueMappings,
          }
          if (id) input.id = id
          this.loadingCount++
          this.$apollo.mutate({
            mutation: MUTATION_DS_SAVE_COMMON_CODE_VALUE_MAPPING,
            variables: {
              input,
            },
            update: (store, {data: {data}}) => {
              this.loadingCount--
              if (data) {
                this.message()
                this.$router.push({path: 'common-code-detail-map', query: {id: this.codeId, cnName: this.cnName}})
              }
            },
          }).catch(e => {
            this.loadingCount--
          })
        }
      },
      getMapingRefs (key) {
        return key.map(x => this.$refs[x])
      },
      onMapToggleBefore (val) {
        if (!val) { // 先关闭其它展开的mapping form-item
          const $refs = this.getMapingRefs(['tableColumns', 'checkList'])
          $refs.forEach(x => { if (x.visible) { x.visible = false } })
        }
      },
      handleTechTypeChange (arrays) {
        if (arrays && arrays.length < 3) {
          this.$message.error('请选择（平台/系统/库）')
          return
        }
        if (this.$refs['techTree'].getCheckedNodes()[0]) {
          this.form.techTypeLabels = this.$refs['techTree'].getCheckedNodes()[0].pathLabels
        }
        const $tableColumns = this.$refs['tableColumns']
        $tableColumns.techCategoryId = this.form.techType[this.form.techType.length - 1]
        $tableColumns.mdsSearch() // 查看表
        const $checkList = this.$refs['checkList']
        $checkList.getDqsScheduleList() // 查看检查规则
        if (Object.prototype.toString.call(arrays) === '[object Array]') {
          this.form.tableColumns = []
          this.form.checkList = []
        }
      },
      onAddValuesItem (type) {
        switch (type) {
          case 'new': // 新增
            const item = JSON.parse(JSON.stringify(this.rowItem))
            this.list.push(item)
            break
        }
      },
      async getCommonCodeValues () {
        this.loadingCount++
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_COMMON_CODE_VALUES,
          fetchPolicy: 'network-only',
          variables: {
            codeId: this.codeId,
          },
        })
        this.loadingCount--
        this.values = data || []
      },
      deleteMap (id) {
        this.loadingCount++
        this.$apollo.mutate({
          mutation: MUTATION_DS_DEL_COMMON_CODE_VALUE_MAPPING,
          variables: {
            id,
          },
          update: (store, {data: {data}}) => {
            this.loadingCount--
            if (data) {
              this.message()
            }
          },
        }).catch(e => {
          this.loadingCount--
        })
      },
      onTableHandler (e, row, type, index) {
        switch (type) {
          case 'edit': // 编辑
            row.isEdit = true
            break
          case 'delete': // 删除
            this.list.splice(index, 1)
            break
        }
      },
    },
  }
</script>

<style lang="scss">
  .cc-map-create {
    @apply bg-white flex-1;

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
      padding: 20px 24px;
      box-sizing: border-box;

      .common-buttons {
        @apply text-center;

        margin-top: 16px;
        width: 100%;
        margin-bottom: 40px;
        font-size: 14px;
      }

      .common-table {
        .el {
          &-input {
            &__inner,
            &__icon {
              line-height: 24px;
            }

            &__inner {
              height: 24px;
            }
          }
        }
      }

      .btn-group {
        @apply text-center;

        .el-button {
          margin-left: 50px;
        }
      }
    }
  }

</style>
