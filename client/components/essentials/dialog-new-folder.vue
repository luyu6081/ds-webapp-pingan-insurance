<script>

  import {
    Button as ElButton,
    Dialog as ElDialog,
  } from 'element-ui'

  import CommonForm from '~/components/common/form'

  import MUTATION_DS_SUBJECT from '~/graphql/standard/ds-save-subject-mutation.gql'

  export default {
    props: {
      visible: Boolean,
      form: Object,
    },
    components: {
      CommonForm,
      ElButton,
      ElDialog,
    },
    data () {
      return {
        title: '新建文件夹',
        list: [
          {
            label: '文件夹名称',
            key: 'cnName',
            type: 'text',
            width: 100,
          },
        ],
        rules: {
          cnName: [
            {required: true, message: '请输入文件夹名称', trigger: 'blur'},
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
      async onConfirm () {
        const $form = this.$refs['form']
        await $form.onSubmit()
        if (!$form.validate) return

        const {pid, cnName, type} = this.form
        const input = {
          pid,
          cnName,
          type,
        }
        this.$apollo.mutate({
          mutation: MUTATION_DS_SUBJECT,
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
              this.$parent.getDsSubject(data)
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
          <common-form ref="form" form={this.form} list={this.list} rules={this.rules} label-width={150}></common-form>
          <div slot="footer">
            <el-button onClick={() => this.onCancel()}>取消</el-button>
            <el-button type="primary" onClick={() => this.onConfirm()}>确认</el-button>
          </div>
        </el-dialog>
      )
    },
  }
</script>

<style lang="scss">

</style>
