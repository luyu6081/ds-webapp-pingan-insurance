<template>
  <el-dialog :title="title"
             :visible.sync="isVisible"
             :close-on-click-modal="false"
             append-to-body
             width="640px"
             :before-close="handleClose">
    <common-form ref="form" :rules="organizationsRules" :list="organizationsList" :form="form"></common-form>
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
  } from 'element-ui'

  import MUTATION_DS_SAVE_INSTITUTIONAL from '~/graphql/organizations/ds-save-institutional-mutation.gql'

  import MessageBoxMixins from '~/mixins/message-box'
  import CommonForm from '~/components/common/form'
  import {organizationsList, organizationsRules} from '~/components/organizations/dialog-edit/data'

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
        organizationsList,
        organizationsRules,
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
        return `机构清单${obj[type]}`
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
      async onSave (cb) {
        const $form = this.$refs['form']
        await $form.onSubmit()
        if ($form.validate) {
          const {
            id,
            pid,
            cnName,
            enName,
            number,
            enAbridge,
            description,
          } = this.form
          const input = {
            pid,
            number,
            enName,
            enAbridge,
            cnName,
            description,
          }
          if (id) input.id = id
          this.$apollo.mutate({
            mutation: MUTATION_DS_SAVE_INSTITUTIONAL,
            variables: {
              input,
            },
            update: (store, {data: {data}}) => {
              if (data) {
                this.onCancel()
                if (typeof cb === 'function') {
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
        }
      },
      onSubmit () {
        this.onSave(this.$parent.onSubmitAudit)
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
