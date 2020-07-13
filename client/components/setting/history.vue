<template>
  <el-dialog :visible.sync="isVisible"
             :title="title"
             width="700px"
             append-to-body
             :before-close="onHandleClose"
             class="dialog-setting-history">
    <common-table ref="table" :list="list" :columns="columns"></common-table>
  </el-dialog>
</template>

<script>
  import {
    // Button as ElButton,
    Dialog as ElDialog,
  } from 'element-ui'

  import CommonTable from '~/components/common/table'
  import {HISTORY_COLUMNS} from '~/components/setting/data'

  import QUERY_DS_STANDARD_SCORE_HISTORYS_LIST from '~/graphql/setting/ds-standard-score-historys-query.gql'

  import {formatDate} from '~/utils/date'

  export default {
    components: {
      // ElButton,
      CommonTable,
      ElDialog,
    },
    props: {
      visible: Boolean,
      title: String,
      objectId: String,
    },
    data () {
      return {
        isVisible: this.visible,
        list: [],
        columns: null,
      }
    },
    methods: {
      init () {
        this.columns = HISTORY_COLUMNS.bind(this)()
        this.load()
      },
      async load () {
        let {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_STANDARD_SCORE_HISTORYS_LIST,
          fetchPolicy: 'network-only',
          variables: {
            objectId: this.objectId,
          },
        })
        data = data || []
        data.forEach(x => {
          x.errorRate = x.errorRate !== null ? `${x.errorRate}%` : null
          x.createTm = formatDate(x.createTm)
        })
        this.list = data
      },
      onHandleClose (done) {
        if (typeof done === 'function') {
          done()
        }
        this.onCancel()
      },
      onCancel () {
        this.$emit('update:visible', false)
      },
    },
    watch: {
      'visible' (newVal) {
        this.isVisible = newVal
        if (newVal) {
          this.init()
        }
      },
    },
  }
</script>

<style lang="scss">
  .dialog-setting-history {
    @apply text-left;

    .score {
      color: #faad14;

      &.green {
        color: #50c51a
      }
    }
  }
</style>
