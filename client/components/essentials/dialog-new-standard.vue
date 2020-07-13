<script>

  import {
    Button as ElButton,
    Dialog as ElDialog,
  } from 'element-ui'

  import CommonForm from '~/components/common/form'

  import MUTATION_DS_SUBJECT from '~/graphql/standard/ds-save-subject-mutation.gql'

  import MessageBoxMixins from '~/mixins/message-box'

  export default {
    mixins: [MessageBoxMixins],
    props: {
      visible: Boolean,
      isEdit: Boolean,
      form: Object,
    },
    computed: {
      title () {
        return `${this.isEdit ? '编辑' : '新建'}基础标准`
      },
    },
    components: {
      CommonForm,
      ElButton,
      ElDialog,
    },
    data () {
      return {
        list: [
          {
            label: '编号',
            key: 'number',
            type: 'text',
          },
          {
            label: '中文名称',
            key: 'cnName',
            type: 'text',
          },
          {
            label: '英文名称',
            key: 'enName',
            type: 'text',
          },
          {
            label: '别名',
            key: 'anName',
            type: 'text',
          },
          {
            label: '描述',
            key: 'description',
            type: 'textarea',
          },
        ],
        rules: {
          indicia: [
            {required: true, message: '请输入编号', trigger: 'blur'},
          ],
          cnName: [
            {required: true, message: '请输入中文名称', trigger: 'blur'},
          ],
          enName: [
            {required: true, message: '请输入英文名称', trigger: 'blur'},
          ],
        },
      }
    },
    methods: {
      onHandlerClose (done) {
        if (typeof done === 'function') {
          done()
        }
        this.onCancel()
      },
      onCancel () {
        this.$refs['form'].resetFields()
        this.$emit('update:visible', false)
      },
      // 提交
      onSubmit () {
        this.onConfirm({submit: true})
      },
      // 保存
      async onConfirm ({submit} = {}) {
        const $form = this.$refs['form']
        await $form.onSubmit()
        if (!$form.validate) return
        const {id, pid, cnName, enName, anName, number, type, description} = this.form
        const input = {
          id,
          pid,
          cnName,
          enName,
          anName,
          number,
          type,
          description,
        }
        this.$apollo.mutate({
          mutation: MUTATION_DS_SUBJECT,
          variables: {
            input,
          },
          update: (store, {data: {data}}) => {
            if (data) {
              this.onCancel()
              // 提交审核
              if (submit) {
                let operation = 'ADD'
                if (this.isEdit) {
                  operation = 'UPDATE'
                }
                const params = {
                  title: cnName,
                  id: data,
                  type: 'STANDARD',
                  operation,
                }
                this.$parent.onSubmitAttribute(params, {cb: this.$parent.getDsSubject, cbParams: data})
              } else {
                this.message()
                // 更新父页面
                this.$parent.getDsSubject(data)
              }
            }
          },
        })
      },
    },
    render (h) {
      return (
        <el-dialog title={this.title}
                   visible={this.visible}
                   close-on-click-modal={false}
                   append-to-body
                   width="584px"
                   beforeClose={(done) => this.onHandlerClose(done)}
                   class="dialog-new-standard">
          <common-form ref="form" form={this.form} list={this.list} rules={this.rules}></common-form>
          <div slot="footer">
            <el-button onClick={() => this.onCancel()}>取消</el-button>
            <el-button onClick={() => this.onConfirm()}>保存</el-button>
            <el-button type="primary" onClick={() => this.onSubmit()}>提交</el-button>
          </div>
        </el-dialog>
      )
    },
  }
</script>

<style lang="scss">
  .dialog-new-standard {
    .el-form {
      .el-form-item {
        flex-basis: 50%;

        &__textarea {
          flex-basis: 100%;
        }
      }
    }
  }
</style>
