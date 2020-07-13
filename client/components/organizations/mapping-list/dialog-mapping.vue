<template>
  <el-dialog :visible.sync="isVisible"
             :title="title"
             width="700px"
             :close-on-click-modal="false"
             :before-close="onHandleClose"
             append-to-body
             class="dialog-organizations-mapping">
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
      <el-form-item label="表：" prop="tableId">
        <el-select v-model="form.tableId"
                   filterable
                   remote
                   :disabled="form.techType.length < 3"
                   reserve-keyword
                   placeholder="请输入关键词"
                   :remote-method="mdsSearch"
                   :loading="loading"
                   ref="tableId">
          <el-option v-for="item in tableList"
                     :key="item.id"
                     :label="item.name"
                     :value="item.id">
            <!-- <span class="form-table-item-name">{{ item.name }}</span> -->
            <!-- <span class="form-table-item-cnName">{{ item.chineseName }}</span> -->
          </el-option>
        </el-select>
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
    Option as ElOption,
    Select as ElSelect,
  } from 'element-ui'

  import {mapGetters, mapActions} from 'vuex'

  import QUERY_MDS_SEARCH from '~/graphql/essentials/mds-search-query.gql'
  import MUTATION_DS_SAVE_INSTITUTIONAL_MAPPING from '~/graphql/organizations/ds-save-institutional-mapping-mutation.gql'

  export default {
    components: {
      ElButton,
      ElCascader,
      ElDialog,
      ElForm,
      ElFormItem,
      ElOption,
      ElSelect,
    },
    props: {
      visible: Boolean,
      info: {
        type: Object,
        default: () => { return {} },
      },
      title: String,
    },
    computed: {
      ...mapGetters({
        techTree: 'techTree',
      }),
    },
    data () {
      return {
        isVisible: this.visible,
        tableList: [],
        loading: false,
        cascaderProps: {
          label: 'name',
          value: 'id',
        },
        form: {
          id: null,
          techType: [],
          tableId: null, // 表
          techTypeLabels: [],
        },
        rules: {
          techType: [
            {type: 'array', required: true, message: '请选择（平台/系统/库）', trigger: 'change'},
          ],
          tableId: [
            {required: true, message: '请选择表', trigger: 'change'},
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
      // 表
      async mdsSearch (keyword) {
        this.loading = true
        const input = {
          techCategoryId: this.form.techType[this.form.techType.length - 1],
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
        this.loading = false
        data = data || []
        let list = []
        data.map(x => {
          const {id, name, chineseName} = x
          list.push({
            id,
            name,
            chineseName,
          })
        })
        this.tableList = list
      },
      handleTechTypeChange (arrays) {
        if (this.$refs['techTree'].getCheckedNodes()[0]) {
          this.form.techTypeLabels = this.$refs['techTree'].getCheckedNodes()[0].pathLabels
        }
        this.form.tableId = null
        this.mdsSearch()
      },
      async initForm () {
        let {id, tableId, tableName, platformId, platformName, systemId, systemName, dbId, dbName} = this.info
        const techTypeLabels = [platformName, systemName, dbName]
        let techType = []
        if (platformId && systemId && dbId) {
          techType = [platformId, systemId, dbId]
        }
        this.form.techType = techType
        if (tableId && tableName) {
          await this.mdsSearch()
        }
        this.form = {
          id,
          tableId,
          techTypeLabels,
          techType,
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
        const {form: {id, techType, techTypeLabels, tableId}} = this
        const input = {
          id,
          institutionalId: this.$route.params.id,
          platformName: techTypeLabels[0],
          platformId: techType[0],
          systemName: techTypeLabels[1],
          systemId: techType[1],
          dbName: techTypeLabels[2],
          dbId: techType[2],
          tableName: this.$refs['tableId'].selectedLabel,
          tableId,
        }
        let mutation = MUTATION_DS_SAVE_INSTITUTIONAL_MAPPING
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
              this.$parent.getMappingData()
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
          this.$refs['form'].resetFields()
        }
      },
    },
  }
</script>

<style lang="scss">
  $line-height: 32px;

  .dialog-organizations-mapping {
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

  .form-table-item {
    &-name,
    &-cnName {
      @apply inline-block align-middle;

      width: 120px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    &-name {
    }

    &-cnName {

    }
  }
</style>
