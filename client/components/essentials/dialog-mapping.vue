<template>
  <el-dialog :visible.sync="isVisible"
             :title="title"
             width="700px"
             append-to-body
             :before-close="onHandleClose"
             :close-on-click-modal="false"
             class="dialog-mapping">
    <el-form  ref="form"
             :rules="rules"
             :model="form"
             label-width="100px">
      <el-form-item label="库：" prop="techType">
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
    <div slot="footer">
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import {
    Button as ElButton,
    Cascader as ElCascader,
    Dialog as ElDialog,
    Form as ElForm,
    FormItem as ElFormItem,
  } from 'element-ui'

  import {mapGetters, mapActions} from 'vuex'

  import Mapping from '~/components/essentials/map'

  import MUTATION_STANDARD_DS_SAVE_ATTRIBUTE_MAPPING from '~/graphql/standard/ds-save-attribute-mapping-mutation.gql'
  import MUTATION_DS_SAVE_STATISTICALL_MAPPING from '~/graphql/statisticals/ds-save-statisticall-mapping-mutation.gql'
  import MUTATION_DS_SAVE_INSTITUTIONAL_MAPPING from '~/graphql/organizations/ds-save-institutional-mapping-mutation.gql'

  export default {
    props: {
      visible: Boolean,
      info: {
        type: Object,
        default: () => { return {} },
      },
      title: String,
    },
    components: {
      Mapping,
      ElButton,
      ElCascader,
      ElDialog,
      ElForm,
      ElFormItem,
    },
    computed: {
      ...mapGetters({
        techTree: 'techTree',
      }),
    },
    data () {
      return {
        isVisible: this.visible,
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
        cascaderProps: {
          label: 'name',
          value: 'id',
        },
        form: {
          id: null,
          techType: [],
          tableColumns: [], // 表，字段
          checkList: [], // 检查规则
          techTypeLabels: [],
        },
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
      }
    },
    mounted () {
      this.categoriesTechList()
    },
    methods: {
      ...mapActions({
        categoriesTechList: 'categoriesTechList',
      }),
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
      initForm () {
        let {id, tableId, tableName, fieldId, fieldName, ruleIds, ruleNames, platformId, systemId, dbId} = this.info
        const tableColumns = []
        const techTypeLabels = []
        let checkList = []
        let techType = []
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
          id,
          tableColumns,
          checkList,
          techTypeLabels,
          techType,
        }
        this.tableColumns.forEach(x => { x.list = [] })
        this.checkList.forEach(x => { x.list = [] })
        if (platformId) {
          this.$nextTick(() => {
            this.handleTechTypeChange()
          })
        }
      },
      onHandleClose (done) {
        if (typeof done === 'function') {
          done()
        }
        this.onCancel()
      },
      onCancel () {
        this.$refs['form'].resetFields()
        this.$emit('update:visible', false)
      },
      async addMappingData () {
        const {form: {id, techType, checkList, techTypeLabels, tableColumns}} = this
        if (techType.length !== 3) {
          this.$message.error('请选择（平台/系统/库）')
          return
        }
        if (tableColumns.length !== 2) {
          this.$message.error('请选择字段')
          return
        }
        const input = {
          id,
          tableId: tableColumns[0].id,
          fieldId: tableColumns[1].id,
          ruleIds: checkList.map(x => x.id),
          platformName: techTypeLabels[0],
          platformId: techType[0],
          systemName: techTypeLabels[1],
          systemId: techType[1],
          dbName: techTypeLabels[2],
          dbId: techType[2],
          tableName: tableColumns[0].name,
          fieldName: tableColumns[1].name,
          ruleNames: checkList.map(x => x.name),
        }
        let mutation = null
        const {name} = this.$route
        if (name === 'essentials') { // 基础标准页面弹窗
          input.attributeId = this.$parent.attributeForm.id
          mutation = MUTATION_STANDARD_DS_SAVE_ATTRIBUTE_MAPPING
        } else if (name === 'stats-specs-detail' || name === 'index-manager' || name === 'index-manager-info') { // 统计标准页面 指标页面
          input.statisticalId = this.$parent.id
          mutation = MUTATION_DS_SAVE_STATISTICALL_MAPPING
        } else if (name === 'organizationsMappingList') { // 机构清单页面
          mutation = MUTATION_DS_SAVE_INSTITUTIONAL_MAPPING
        }
        this.$apollo.mutate({
          mutation,
          variables: {
            input,
          },
          update: (store, {data: {data}}) => {
            if (data) {
              this.$message({
                message: '保存成功！',
                type: 'success',
              })
              this.onCancel()
              if (name === 'essentials') { // 基础标准页面弹窗
                // 父页面刷新
                this.$parent.getAttributeMapping(this.$parent.attributeForm.id)
              } else if (name === 'stats-specs-detail' || name === 'index-manager' || name === 'index-manager-info') { // 统计标准页面  统计标准
                this.$parent.getMappingData()
              } else if (name === 'organizationsMappingList') { // 机构清单页面
                this.$parent.getMappingData()
              }
            }
          },
        })
      },
      onConfirm () {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            this.addMappingData()
          }
        })
      },
    },
    watch: {
      'info' (newVal) {
        this.initForm()
      },
      'visible' (newVal) {
        this.isVisible = newVal
        if (!newVal) {
          // 清空form值
          const $tableColumns = this.$refs['tableColumns']
          if ($tableColumns) {
            const tCard = $tableColumns.$refs['card']
            if (tCard && tCard.length) {
              tCard.forEach(x => { x.keyword = null })
            }
          }
          const $checkList = this.$refs['checkList']
          if ($checkList) {
            const cCard = $tableColumns.$refs['card']
            if (cCard && cCard.length) {
              cCard.forEach(x => { x.keyword = null })
            }
          }
        }
      },
    },
  }
</script>

<style lang="scss">
  $line-height: 32px;

  .dialog-mapping {
    .el-form-item {
      margin-right: 0;
      margin-bottom: 16px;

      &__label,
      &__content {
        line-height: $line-height;
      }

      &.is-error {
        .essentials-map {
          &__value {
            border-color: #F56C6C;
          }

          .el-input__inner {
            @apply border-blue;
          }
        }
      }
    }

    .el {
      &-input__icon,
      &-cascader {
        line-height: $line-height;
      }

      &-input__inner {
        height: $line-height;
        line-height: $line-height;
      }
    }
  }
</style>
