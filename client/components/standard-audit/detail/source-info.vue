<template>
  <!-- 资源信息审核 -->
  <standard-audit-card class="source-info-audit">
    <template #header>
      资源信息审核
    </template>
    <common-form ref="form" :form="info" :list="sourceInfoList" :rules="sourceInfoRules"></common-form>
    <div class="btn-group">
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm">提交</el-button>
    </div>
  </standard-audit-card>
</template>

<script>
  import {
    Button as ElButton,
  } from 'element-ui'

  import {mapActions, mapGetters} from 'vuex'

  import StandardAuditCard from '~/components/standard-audit/card'
  import CommonForm from '~/components/common/form'

  import MUTATION_DS_COMPLETE_AUDIT from '~/graphql/audit/ds-complete-audit-mutation.gql'

  import {sourceInfoList, sourceInfoRules, transUser} from '~/components/standard-audit/detail/data'

  export default {
    props: {
      info: Object,
    },
    components: {
      StandardAuditCard,
      CommonForm,
      ElButton,
    },
    computed: {
      ...mapGetters({
        'userList': 'user/userList',
      }),
    },
    data () {
      return {
        sourceInfoList: [],
        sourceInfoRules,
        transUser,
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      ...mapActions({
        'getUserList': 'user/getUserList',
      }),
      init () {
        this.sourceInfoList = JSON.parse(JSON.stringify(sourceInfoList))
        this.transUser.attrs.remoteMethod = this.getUserList
      },
      onCancel () {
        this.$refs['form'].resetFields()
      },
      async onConfirm () {
        const $form = this.$refs['form']
        await $form.onSubmit()
        if ($form.validate) {
          const input = {
            auditIds: [this.$parent.id],
          }
          const keys = Object.keys(this.info)
          keys.forEach(x => {
            if (this.info[x]) input[x] = this.info[x]
          })
          this.onHandlerPass(input)
        }
      },
      onHandlerPass (input) {
        this.$apollo.mutate({
          mutation: MUTATION_DS_COMPLETE_AUDIT,
          variables: {
            input,
          },
          update: (store, {data: {data}}) => {
            if (data) {
              this.$message({
                message: '操作成功！',
                type: 'success',
              })
              window.location.reload()
            }
          },
        })
      },
    },
    watch: {
      'info.operation' (newVal, oldVal) {
        const $form = this.$refs['form']
        $form.$refs['ruleForm'].clearValidate(['userId', 'opinion'])
        if (Object.keys(this.info).includes('userId') && this.sourceInfoList.filter(x => x.key === 'userId').length > 0) {
          delete this.info.userId
          this.sourceInfoList.splice(1, 1)
        }
        if (newVal === 'RESOLVE') {
          this.$set(this.info, 'userId', null)
          this.sourceInfoList.splice(1, 0, this.transUser)
        }
      },
      userList: {
        handler (newVal) {
          if (this.info.operation === 'RESOLVE') {
            this.sourceInfoList[1].options = newVal
          }
        },
        immediate: true,
        deep: true,
      },
    },
  }
</script>

<style lang="scss">
  .source-info-audit {
    .el-form.essentials-form {
      margin-top: 10px;

      .el-form-item {
        flex-basis: 100%;
      }
    }

    .btn-group {
      @apply text-center;

      margin: 40px 0;
      font-size: 0;
    }
  }
</style>
