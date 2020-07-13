<template>
  <el-dialog :title="title"
             :visible.sync="isVisible"
             width="640px"
             append-to-body
             :close-on-click-modal="false"
             :before-close="handleClose">
    <common-form ref="form" :rules="commonCodeValuesRules" :list="commonCodeValuesList" :form="form"></common-form>
    <div slot="footer">
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onSubmit">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import {
    Button as ElButton,
    Dialog as ElDialog,
  } from 'element-ui'

  import MUTATION_DS_SAVE_COMMON_CODE_VALUE from '~/graphql/common-code/ds-save-common-code-value-mutation.gql'

  import MessageBoxMixins from '~/mixins/message-box'
  import CommonForm from '~/components/common/form'
  import {commonCodeValuesList, commonCodeValuesRules} from '~/components/common-code/dialog-detail-code/data'

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
        commonCodeValuesList,
        commonCodeValuesRules,
      }
    },
    components: {
      CommonForm,
      ElButton,
      ElDialog,
    },
    computed: {
      title () {
        let type = 'new'
        if (this.form.id) { type = 'edit' }
        const obj = {new: '新建', edit: '编辑'}
        return `编码${obj[type]}`
      },
    },
    mounted () {
    },
    methods: {
      handleClose (done) {
        done()
        this.$emit('update:visible', false)
      },
      onCancel () {
        this.$emit('update:visible', false)
      },
      async onSave () {
        const $form = this.$refs['form']
        await $form.onSubmit()
        if ($form.validate) {
          const {
            id,
            cnName,
            enName,
            value,
            description,
          } = this.form
          const input = {
            codeId: this.$parent.id,
            value,
            cnName,
            enName,
            description,
          }
          if (id) input.id = id
          this.$apollo.mutate({
            mutation: MUTATION_DS_SAVE_COMMON_CODE_VALUE,
            variables: {
              input,
            },
            update: (store, {data: {data}}) => {
              if (data) {
                this.onCancel()
                this.message()
                // 刷新列表页面
                this.$parent.getValueList()
              }
            },
          })
        }
      },
      onSubmit () {
        this.onSave()
      },
    },
    watch: {
      'visible' (newVal) {
        this.isVisible = newVal
        if (!newVal) {
          this.$refs['form'].resetFields()
        }
      },
    },
  }
</script>
