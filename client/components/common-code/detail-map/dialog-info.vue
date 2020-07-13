<template>
  <el-dialog :title="title"
             :visible.sync="isVisible"
             width="640px"
             append-to-body
             :before-close="handleClose"
             class="common-code-detail-map-dialog-info">
    <div class="content">
      <ej-search-input v-model="keyWord"
                       height="34"
                       placeholder="请输入搜索条件"
                       @search="getMapDetail"/>
      <div class="list">
        <div class="list-row__head">
          <div class="list-row title">
            <div>标准</div>
            <div>映射</div>
          </div>
          <div class="list-row th">
            <div>编码</div>
            <div>名称</div>
            <div>编码</div>
            <div>名称</div>
          </div>
        </div>
        <div class="list-row data"
              v-for="(item, index) in list"
              :key="index">
            <div>{{ item.codeValue }}</div>
            <div>{{ item.codeValueName }}</div>
            <div>{{ item.value }}</div>
            <div>{{ item.code }}</div>
          </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>

  import {
    Dialog as ElDialog,
  } from 'element-ui'

  import {
    SearchInput as EjSearchInput,
  } from '@ej/ui'

  import QUERY_DS_COMMON_CODE_VALUE_MAPPINGS from '~/graphql/common-code/ds-common-code-value-mappings-query.gql'

  export default {
    components: {
      ElDialog,
      EjSearchInput,
    },
    props: {
      info: {
        type: Object,
        default: () => { return {} },
      },
      visible: Boolean,
    },
    computed: {
      title () {
        const {dbName, tableName, fieldName} = this.info || {}
        return `${dbName} / ${tableName} / ${fieldName}   编码映射值`
      },
    },
    data () {
      return {
        isVisible: false,
        keyWord: null,
        list: [],
      }
    },
    methods: {
      init () {
        this.keyWord = null
        this.list = []
        this.getMapDetail()
      },
      async getMapDetail () {
        const {info: {id}, keyWord} = this
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_COMMON_CODE_VALUE_MAPPINGS,
          fetchPolicy: 'network-only',
          variables: {
            codeMappingId: id,
            keyWord,
          },
        })
        this.list = data || []
      },
      handleClose (done) {
        done()
        this.$emit('update:visible', false)
      },
    },
    watch: {
      'visible' (newVal) {
        this.init()
        this.isVisible = newVal
      },
    },
  }
</script>

<style lang="scss">
  .common-code-detail-map-dialog-info {

    .el-dialog__title {
      @apply inline-block;

      width: 75%;
      word-break: break-all;
    }

    .content {
      @apply text-right;
    }
    .ej-input {
      width: 196px;
    }

    .list {
      @apply text-center;

      margin-top: 12px;
      margin-bottom: 50px;
      max-height: 300px;
      overflow-y: auto;

      &-row {
        @apply flex flex-1 flex-row flex-shrink-0;

        line-height: 40px;
        border-bottom: 1px solid #e8e8e8;
        box-sizing: border-box;

        &__head {
        }

        &.title {
          @apply text-gray-darkest;

          line-height: 36px;
          font-size: 16px;
          border-top: 1px solid #e8e8e8;

          > div {
            border-right: 1px solid #e8e8e8;
          }
        }

        &.th {
          background-color: #FAFAFA;
        }

        &.data {
          > div {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
          }
        }

        > div {
          @apply flex-1 flex-shrink-0;

          padding: 0 10px;

          &:nth-of-type(2n) {
            border-right: 1px solid #e8e8e8;

            &:last-of-type {
              border-right: none;
            }
          }
        }
      }
    }
  }
</style>
