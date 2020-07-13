<template>
  <div class="stats-specs-detail" v-ej-loading.fullscreen="loading">
    <div class="stats-specs-detail__header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="(item, index) in menuList"
                            :key="index"
                            :to="{ path: item.path }">{{ item.label }}</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- , 'question' -->
        <busi-buttons v-model="busiButtonsObj"
                      :show-button="['collect', 'watched', 'import']"
                      :operaId="id"
                      :title="info.cnName"
                      :disabled="isReadOnly"
                      type="STATISTICS"
                      class="inline-block mr-6"
                      @click="onOperate"/>
    </div>
    <div class="stats-specs-detail__content">
      <div class="detail">
        <h3>{{info.cnName}}<span class="sub-title">{{info.enName}}</span></h3>
        <div v-for="(item, index) in labelList"
              :key="index"
              :class="['detail-item', `${item.type ? `is-${item.type}`: ''}`]"
              :style="{'flex-basis': `${item.basis}%`}">
              <span class="detail-item__label">{{ item.label }}：</span>
              <span class="detail-item__value">{{ item.value }}</span>
        </div>
      </div>
      <div class="mapping">
        <h3>映射</h3>
        <ej-search-input v-model="keyWord"
                       width="180px"
                       height="34"
                       placeholder="请输入搜索条件"
                       @search="getMappingData"/>

        <common-table :list="mappingList" :columns="columns"></common-table>
        <!-- 映射弹窗 -->
        <busi-buttons :disabled="isReadOnly" :show-button="['new']" @click="onMapDialogShow"/>
      </div>
    </div>

    <dialog-mapping :title="mapTitle"
                    :visible.sync="mappingVisible" :info="mappingForm"></dialog-mapping>
  </div>
</template>

<script>
  import {
    // Button as ElButton,
    Breadcrumb as ElBreadcrumb,
    BreadcrumbItem as ElBreadcrumbItem,
  } from 'element-ui'

  import {
    SearchInput as EjSearchInput,
  } from '@ej/ui'

  import runtimeArgs from '@/runtime-args'

  import QUERY_DS_STATISTICAL from '~/graphql/statisticals/ds-statistical-query.gql'
  import QUERY_DS_STATISTICAL_MAPPINGS from '~/graphql/statisticals/ds-statistical-mappings-query.gql'
  import QUERY_DS_STATISTICAL_MAPPING from '~/graphql/statisticals/ds-statistical-mapping-query.gql'
  import QUERY_DS_IS_COLLECT_SUBSCRIBE from '~/graphql/common/ds-is-collect-subscribe-query.gql'
  import QUERY_DS_EXPORT_STANDARD from '~/graphql/common/ds-export-standard-query.gql'
  import MUTATION_DS_DEL_STATISTICALL_MAPPING from '~/graphql/statisticals/ds-del-statisticall-mapping-mutation.gql'

  import BusiButtons from '~/components/busiButtons/busi-buttons'
  import DialogMapping from '~/components/essentials/dialog-mapping'
  import CommonTable from '~/components/common/table'
  import MessageBoxMixins from '~/mixins/message-box'
  import CommonVersionMixins from '~/mixins/common-version'

  import {labelList, COLUMNS} from '~/components/stat-specs/detail/data'

  export default {
    mixins: [
      MessageBoxMixins,
      CommonVersionMixins,
    ],
    components: {
      // ElButton,
      ElBreadcrumb,
      ElBreadcrumbItem,
      BusiButtons,
      DialogMapping,
      CommonTable,
      EjSearchInput,
    },
    computed: {
      loading () {
        return this.loadingCount !== 0
      },
    },
    data () {
      return {
        type: 'STATISTICS',
        id: null,
        info: {},
        busiButtonsObj: {
          isCollect: false,
          isWatched: false,
        },
        labelList,
        menuList: [],
        mappingVisible: false,
        mapTitle: '',
        mappingForm: {},
        keyWord: null,
        columns: [],
        mappingList: [],
        loadingCount: 0,
        fileUploadUrl: runtimeArgs.NUXT_ENV_FILE_HTTP_ENDPOINT,
      }
    },
    mounted () {
      this.initData()
    },
    methods: {
      onMapDialogShow (type, mappingForm = {}) {
        const obj = {
          new: '新建',
          edit: '编辑',
        }
        this.mapTitle = `统计标准${obj[type]}映射`
        this.mappingVisible = true
        this.mappingForm = mappingForm
      },
      async onOperate (command) {
        const {type, id} = this
        switch (command) {
          case 'import': // 下载
            const {data: {data}} = await this.$apollo.query({
              query: QUERY_DS_EXPORT_STANDARD,
              fetchPolicy: 'network-only',
              variables: {
                type,
                ids: [id],
              },
            })
            if (data) {
              window.open(`${this.fileUploadUrl}fileDownload?ambryId=${data}`, '_blank')
            }
            break
        }
      },
      async initData () {
        const {id} = this.$route.params
        this.id = id
        this.loadingCount++
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_STATISTICAL,
          fetchPolicy: 'network-only',
          variables: {
            id,
          },
        })
        this.loadingCount--
        this.getMappingData()
        this.getCollectData()
        // 管理部门 管理员
        this.info = data || {}
        this.labelList.forEach(x => {
          if (x.label === '管理部门') {
            x.value = data.department
          } else if (x.label === '管理员') {
            x.value = data.manager && data.manager.name
          } else {
            x.value = this.info[x.key]
          }
        })
        this.menuList = [
          {path: '', label: '标准内容'},
          {path: '/stat-specs', label: '统计标准'},
          {path: '', label: this.info.cnName},
        ]
      },

      async getCollectData () {
        const {id, type} = this
        this.loadingCount++
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_IS_COLLECT_SUBSCRIBE,
          fetchPolicy: 'network-only',
          variables: {
            id,
            type,
          },
        })
        this.loadingCount--
        const {isCollect, isSubscribe: isWatched} = data
        this.busiButtonsObj = {
          isCollect,
          isWatched,
        }
      },

      async getMappingData () {
        const {id, keyWord} = this
        this.loadingCount++
        let {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_STATISTICAL_MAPPINGS,
          fetchPolicy: 'network-only',
          variables: {
            statisticalId: id,
            keyWord,
          },
        })
        this.loadingCount--
        this.mappingList = data || []
        this.columns = COLUMNS.bind(this)()
      },

      onTableHandler (e, row, type) {
        const {id} = row
        switch (type) {
          case 'edit':
            this.getStatisticallMapping(id)
            break
          case 'delete':
            this.onDeleteStatisticallMapping(id)
            break
        }
      },
      async getStatisticallMapping (id) {
        this.loadingCount++
        let {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_STATISTICAL_MAPPING,
          fetchPolicy: 'network-only',
          variables: {
            id,
          },
        })
        this.loadingCount--
        this.onMapDialogShow('edit', data)
      },
      onDeleteStatisticallMapping (id) {
        this.loadingCount++
        this.$apollo.mutate({
          mutation: MUTATION_DS_DEL_STATISTICALL_MAPPING,
          variables: {
            id,
          },
          update: (store, {data: {data}}) => {
            this.loadingCount--
            if (data) {
              this.message()
              // 信息项
              this.getMappingData()
            }
          },
        }).catch(e => {
          this.loadingCount--
        })
      },
    },
  }
</script>

<style lang="scss">
  .stats-specs-detail {
    @apply bg-white flex-1 flex flex-col;

    &__header {
      @apply text-gray-darkest;

      line-height: 50px;
      height: 50px;
      background-color: #f4f7fe;
      padding-left: 24px;

      .common-buttons {
        float: right;
        margin-right: 24px;
      }
    }

    &__content {
      @apply text-gray-darkest flex-1 flex flex-col;

      padding: 20px 24px 20px 34px;
      box-sizing: border-box;
      font-size: 14px;

      .detail,
      .mapping {
        @apply flex-1;
      }

      .detail{
        @apply flex flex-row flex-wrap;

        h3 {
          @apply relative font-bold;

          flex-basis: 100%;
          line-height: 24px;
          font-size: 16px;

          &::before {
            @apply bg-blue absolute;

            width: 2px;
            height: 12px;
            top: 6px;
            left: -10px;
            content: '';
          }

          .sub-title {
            @apply font-normal;

            margin-left: 16px;
            font-size: 12px;
          }
        }

        &-item {
          @apply flex-1 flex flex-row flex-shrink-0 flex-grow-0;

          margin: 8px 0;
          line-height: 22px;

          &:nth-of-type(7) {
            .detail-item__value {
              max-width: 450px;
            }
          }

          &.is-textarea {
            .detail-item__value {
              max-width: none;
              white-space: normal;
              word-break: break-all;
            }
          }

          &__label {
            @apply text-right;

            width: 70px;
          }

          &__value {
            @apply text-gray-darker flex-1;

            max-width: 100px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
          }
        }
      }

      .mapping {
        margin-top: 12px;

        h3 {
          @apply font-bold;

          margin-bottom: 16px;
        }

        .common-table {
          margin: 16px 0;
        }

        .common-buttons {
          @apply text-center;

          width: 100%;
          font-size: 14px;
        }
      }
    }
  }
</style>
