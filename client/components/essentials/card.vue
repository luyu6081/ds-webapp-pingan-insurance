<script>

  import {
    Button as ElButton,
  } from 'element-ui'

  import {
    Icon as EjIcon,
  } from '@ej/ui'

  import BusiButtons from '~/components/busiButtons'
  import CommonForm from '~/components/common/form'
  import CommonTable from '~/components/common/table'
  import DetailCard from '~/components/essentials/detail-card.vue'

  export default {
    props: {
      info: Object,
      isEdit: Boolean,
      onEdit: Function,
      buttonDisabled: Boolean,
    },
    components: {
      ElButton,
      EjIcon,
      BusiButtons,
      CommonForm,
      CommonTable,
      DetailCard,
    },
    methods: {
      async onFormSubmit () {
        let $form = this.$refs['form']
        if ($form) {
          await $form.onSubmit()
          return $form.validate
        }
        return true
      },
      async onResetFields () {
        let $form = this.$refs['form']
        await $form && $form.resetFields()
      },
    },
    render (h) {
      const {modifyTm, title, form, list = [], rules, type, columns = []} = this.info
      return (
        <div class="essentials-card">
          {
            modifyTm ? <div>
                          <p class="latest-time">最新更新时间：{ modifyTm }</p>
                          <el-button type="primary" class="edit" disabled={this.buttonDisabled} onClick={this.onEdit}><ej-icon icon="edit"></ej-icon>编辑</el-button>
                        </div> : ''
          }
          <h4 class="header clearfix">
            <span class="title">{ title }</span>
          </h4>
          {
            type === 'form' ? <common-form ref="form" v-show={this.isEdit} form={form} list={list} rules={rules}></common-form> : ''
          }
          {
            type === 'form' ? <detail-card v-show={!this.isEdit} list={list}></detail-card> : ''
          }
          {
            type === 'table' ? <common-table list={list} columns={columns}></common-table> : ''
          }
        </div>
      )
    },
  }
</script>

<style lang="scss">
  .essentials-card {

    .edit {

      &.el-button {
        margin: 8px 0 0;
        font-size: 12px;
        line-height: 20px;
        padding: 2px 7px;

        &.is-disabled,
        &.is-disabled:hover {
          background-color: #f5f5f5;
          color: #909399;
        }
      }

      svg {
        @apply inline-block;

        width: 10px;
        height: 10px;
        margin-right: 10px;
      }
    }

    .header {
      @apply relative;

      margin-bottom: 12px;
      margin-top: 20px;

      .btn {
        @apply absolute right-0;
      }
      .title {
        @apply text-gray-darkest text-base font-medium font-bold;
      }
    }
  }
</style>
