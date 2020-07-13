<template>
  <el-dialog :title="title"
             :visible.sync="isVisible"
             width="668px"
             :close-on-click-modal="false"
              append-to-body
             :before-close="handleClose">
    <common-form ref="form" :rules="statisticalRules" :list="statisticalList" :form="form"></common-form>
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

  import {mapActions, mapGetters} from 'vuex'

  import MUTATION_DS_SAVE_STATISTICAL from '~/graphql/statisticals/ds-save-statistical-mutation.gql'

  import MessageBoxMixins from '~/mixins/message-box'
  import CommonForm from '~/components/common/form'
  import {statisticalList, statisticalRules} from '~/components/stat-specs/dialog-edit/data'

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
        statisticalList,
        statisticalRules,
      }
    },
    components: {
      CommonForm,
      ElButton,
      ElDialog,
    },
    computed: {
      ...mapGetters({
        userList: 'user/userList',
      }),
      title () {
        let type = 'new'
        if (this.form.id) { type = 'edit' }
        const obj = {new: '新建', edit: '编辑'}
        return `统计标准${obj[type]}`
      },
    },
    mounted () {
      this.init()
    },
    methods: {
      ...mapActions({
        'getUserList': 'user/getUserList',
      }),
      init () {
        this.getUserList()
        this.statisticalList.forEach(x => {
          if (x.label === '管理员') {
            if (x.attrs.remote) {
              x.attrs.remoteMethod = this.getUserList
            }
          }
        })
      },
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
            cnName,
            enName,
            number,
            type,
            accuracy,
            department,
            managerId,
            unit,
            dimension,
            cycle,
            formula,
            description,
            rule,
            caliber,
          } = this.form
          const input = {
            cnName,
            enName,
            number,
            type,
            accuracy,
            department,
            managerId,
            unit,
            dimension,
            cycle,
            formula,
            description,
            rule,
            caliber,
          }
          if (id) input.id = id
          this.$apollo.mutate({
            mutation: MUTATION_DS_SAVE_STATISTICAL,
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
      userList: {
        handler (newVal) {
          const item = this.statisticalList.filter(x => x.key === 'managerId')[0]
          item.options = newVal
        },
        immediate: true,
        deep: true,
      },
    },
  }
</script>
