<template>
  <el-dialog :title="title"
             :visible.sync="isVisible"
             width="640px"
             append-to-body
             :close-on-click-modal="false"
             :before-close="handleClose"
             class="common-code-dialog-edit">
    <div class="form-item-card">
      <h3>代码信息</h3>
      <common-form ref="form" :rules="commonCodeValuesRules" :list="commonCodeList" :form="form"></common-form>
    </div>
    <div class="form-item-card" v-if="!form.id">
      <h3>添加编码</h3>
      <el-form inline
               ref="values"
               size="mini"
               v-for="(formItem, index) in values"
               :key="index"
               :model="formItem"
               :rules="valuesRules"
               label-width="80px"
               class="essentials-form">
        <el-form-item v-for="(item, iindex) in valuesForm"
                      :key="iindex"
                      :label="`${item.label}：`"
                      :prop="item.key"
                      :class="[`el-form-item__${item.type}`]">
          <el-input :type="item.type" v-model="formItem[item.key]"/>
          <i v-if="iindex === 3" class="el-icon-minus" :disabled="index === 0" @click="onValueRemove(index)"></i>
        </el-form-item>
      </el-form>
      <el-button type="text" @click="onValueAdd"><i class="el-icon-plus"></i>添加</el-button>
    </div>
    <div slot="footer">
      <el-button @click="onCancel">取消</el-button>
      <el-button @click="onSave">保存</el-button>
      <el-button type="primary" @click="onSubmit">提交</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import {
    Button as ElButton,
    Dialog as ElDialog,
    Form as ElForm,
    FormItem as ElFormItem,
    Input as ElInput,
  } from 'element-ui'

  import MUTATION_DS_SAVE_COMMON_CODE from '~/graphql/common-code/ds-save-common-code-mutation.gql'

  import MessageBoxMixins from '~/mixins/message-box'
  import CommonForm from '~/components/common/form'
  import {commonCodeList, valuesRules, valuesForm} from '~/components/common-code/dialog-edit/data'
  import {commonCodeValuesRules} from '~/components/common-code/dialog-detail-code/data'

  export default {
    mixins: [MessageBoxMixins],
    props: {
      visible: Boolean,
      form: {
        type: Object,
        default: () => { return {} },
      },
    },
    data () {
      return {
        isVisible: false,
        valuesRules,
        valuesForm,
        commonCodeList,
        commonCodeValuesRules,
        valueItems: {
          value: null,
          cnName: null,
          enName: null,
          description: null,
        },
        values: [],
      }
    },
    components: {
      CommonForm,
      ElButton,
      ElDialog,
      ElForm,
      ElFormItem,
      ElInput,
    },
    computed: {
      title () {
        let type = 'new'
        if (this.form.id) { type = 'edit' }
        const obj = {new: '新建', edit: '编辑'}
        return `公共代码${obj[type]}`
      },
    },
    methods: {
      handleClose (done) {
        done()
        this.$emit('update:visible', false)
      },
      onCancel () {
        this.$emit('update:visible', false)
      },
      formSubmit (cb) {
        const {
          id,
          cnName,
          enName,
          number,
          rule,
          type,
          length,
          description,
        } = this.form
        const input = {
          cnName,
          enName,
          number,
          rule,
          type,
          length,
          description,
        }
        if (id) input.id = id
        let values = []
        const $values = this.$refs['values']
        if ($values) {
          values = this.values
        }
        input.values = values
        this.$apollo.mutate({
          mutation: MUTATION_DS_SAVE_COMMON_CODE,
          variables: {
            input,
          },
          update: (store, {data: {data}}) => {
            if (data) {
              this.onCancel()
              if (typeof cb === 'function') { // 提交审核
                const cbParams = {
                  title: cnName,
                  type: this.$parent.type,
                  id: data,
                  operation: id ? 'UPDATE' : 'ADD',
                }
                cb(cbParams, {cb: this.$parent.handleSearch, cbParams: this.$parent.keyWord})
              } else {
                this.message()
                this.$parent.handleSearch(this.$parent.keyWord)
              }
            }
          },
        })
      },
      async onSave (cb) {
        const $form = this.$refs['form']
        await $form.onSubmit()
        const $values = this.$refs['values']
        if ($values) {
          Promise
            .all($values.map(x => x.validate()))
            .then(result => {
              if ($form.validate) { this.formSubmit(cb) }
            })
        } else {
          if ($form.validate) { this.formSubmit(cb) }
        }
      },
      onSubmit () {
        this.onSave(this.$parent.onSubmitAudit)
      },
      onValueAdd () {
        const items = JSON.parse(JSON.stringify(this.valueItems))
        this.values.push(items)
      },
      onValueRemove (index) {
        if (this.values.length === 1) {
          this.$message.error('至少保留一项编码')
          return
        }
        this.values.splice(index, 1)
      },
    },
    watch: {
      'visible' (newVal) {
        this.isVisible = newVal
        if (!newVal) {
          this.$refs['form'] && this.$refs['form'].resetFields()
          this.values = []
        } else {
          if (this.values.length === 0) {
            this.onValueAdd()
          }
        }
      },
    },
  }
</script>

<style lang="scss">
  .common-code-dialog-edit {
    .form-item-card {

      h3 {
        @apply text-gray-darkest;

        font-size: 14px;
        line-height: 22px;
        margin-bottom: 10px;
      }

      &:last-of-type {
        margin-top: 36px;

        .el-form {
          padding-right: 35px;
        }
      }

      &:first-of-type {
        margin-top: 0;
      }

      .el-button {
        padding: 4px 13px;

        .el-icon-plus {
          margin-right: 10px;
          font-size: 12px;
        }

        &,
        &:hover,
        &:active,
        &:focus {
          border: 1px dashed #d9d9d9;
        }
      }
    }

    .el-icon-minus {
      @apply absolute bottom-0 text-blue cursor-pointer;

      right: -35px;

      width: 24px;
      height: 24px;
      line-height: 24px;
      border: 1px dashed #d9d9d9;
      box-sizing: border-box;
      text-align: center;

      &[disabled] {
        cursor: not-allowed;
      }
    }
  }
</style>
