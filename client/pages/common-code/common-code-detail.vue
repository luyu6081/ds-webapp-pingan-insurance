<template>
  <div class="common-code-detail-view">
    <div class="detail-up bg-white mt-6 p-6">
      <div class="clearfix">
        <el-breadcrumb separator="/" class="float-left">
          <el-breadcrumb-item>标准内容</el-breadcrumb-item>
          <el-breadcrumb-item :to="{name: 'common-codes'}">公共代码列表</el-breadcrumb-item>
          <el-breadcrumb-item>{{commonCodeDetail.cnName}}</el-breadcrumb-item>
        </el-breadcrumb>
        <collect-and-watched v-model="collectWatchedObj"
                              :operaId="$route.params.id || ''"
                              type="DS_CODE"
                              class="float-right"/>
      </div>
      <h3 class="text-lg text-black font-bold mt-5">{{commonCodeDetail.cnName + '（' + commonCodeDetail.enName + '）'}}</h3>
      <div class="mt-3">
        <div class="flex">
          <div class="w-5/12"><label>标准ID：</label><span>{{commonCodeDetail.standardId}}</span></div>
          <div class="w-5/12"><label>编号：</label><span>{{commonCodeDetail.numberId}}</span></div>
          <div class="w-5/12"><label>编码规则：</label><span>{{commonCodeDetail.codingRules}}</span></div>
          <div class="w-5/12"><label>数据类型：</label><span>{{commonCodeDetail.dataType}}</span></div>
          <div class="w-5/12"><label>数据长度：</label><span>{{commonCodeDetail.dataLength}}</span></div>
        </div>
        <div class="detail-group"><label>业务含义：</label><span>{{commonCodeDetail.businessDesc}}</span></div>
      </div>
    </div>
    <spec-layout @search="handleSearch">
      <template #searchRightArea>
        <div class="flex">
          <div v-if="commonCodeDetail.systemMapping" class="system-mapper">
            <label>系统映射：</label>
            <span class="mr-3">{{commonCodeDetail.systemMapping}}</span>
            <router-link :to="{name: 'sys-mapping', params: {id: commonCodeDetail.id, codeCnName: commonCodeDetail.cnName}}">
              <el-button type="primary" size="small" class="outline-none">查看</el-button>
            </router-link>
          </div>
          <download-comp buisinessType="DS_CODE_INFO"
                        fileType="EXCEL"
                        downloadType="DETAIL"
                        :buisinessField="{id: commonCodeDetail.id}"
                        class="download-btn"/>
        </div>
      </template>

      <template #downArea>
        <el-table ref="table" :data="codeList" :height="tableHeight" style="width: 100%">
          <el-table-column prop="codeValue" label="编码" width="200"/>
          <el-table-column prop="cnName" label="中文名称"/>
          <el-table-column prop="enName" label="英文名称"/>
          <el-table-column prop="bussinessDesc" label="业务含义" width="400"/>
          <el-table-column prop="dataAdmin" label="数据管理员" width="180"/>
        </el-table>
      </template>
    </spec-layout>
  </div>
</template>

<script>

  import {
    Breadcrumb as ElBreadcrumb,
    BreadcrumbItem as ElBreadcrumbItem,
    Button as ElButton,
    Table as ElTable,
    TableColumn as ElTableColumn,
  } from 'element-ui'

  import SpecLayout from '~/components/spec-layout'

  import QUERY_COMMONCODE_DETAIL from '~/graphql/query_commoncode_detail.gql'
  import DownloadComp from '~/components/download'
  import CollectAndWatched from '~/components/collectAndWatched'

  export default {
    name: 'CommonCodeDetailView',

    components: {
      ElBreadcrumb,
      ElBreadcrumbItem,
      ElButton,
      ElTable,
      ElTableColumn,
      SpecLayout,
      DownloadComp,
      CollectAndWatched,
    },

    data () {
      return {
        isLock: false,

        offset: 0,
        limit: 20,

        commonCodeDetail: {},
        codeList: [],

        tableHeight: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight - 270,

        collectWatchedObj: {
          isCollect: false,
          isWatched: false,
        },
      }
    },

    apollo: {
      commonCodeDetailData: {
        query: QUERY_COMMONCODE_DETAIL,
        fetchPolicy: 'network-only',
        variables () {
          return {
            id: this.$route.params.id,
          }
        },
        update (data) {
          if (data.commonCodeValues) {
            this.commonCodeDetail = data.commonCodeValues
            this.collectWatchedObj = {
              isCollect: this.commonCodeDetail.isCollect,
              isWatched: this.commonCodeDetail.isSubscribe,
            }
            this.codeList = data.commonCodeValues.commonCodeValueInfo
          }
        },
      },
    },

    mounted () {
      this.$nextTick(() => {
        this.tableHeight = window.innerHeight - this.$refs.table.$el.offsetTop - 270

        window.onresize = () => {
          this.tableHeight = window.innerHeight - this.$refs.table.$el.offsetTop - 270
        }
      })
    },

    methods: {
      handleSearch (args) {
        let keyword = args
        if (this.commonCodeDetail.commonCodeValueInfo) {
          this.codeList = this.commonCodeDetail.commonCodeValueInfo.filter(data => !args ||
            data.codeValue.toLowerCase().includes(keyword.toLowerCase()) ||
            data.cnName.includes(keyword) ||
            data.enName.toLowerCase().includes(keyword.toLowerCase()) ||
            data.bussinessDesc.includes(keyword) ||
            data.dataAdmin.includes(keyword))
        } else {
          this.codeList = []
        }
      },
    },
  }
</script>

<style lang="scss">
  .common-code-detail-view {
    min-width: 1100px;

    .el-button {
      @apply py-1 px-4 text-black; // bg-purple
    }

    .el-table__header-wrapper tr th {
      @apply text-black;// bg-purple-lighter
    }

    .el-table td, .el-table th {
      padding: 10px 0;
    }

    .el-table__expand-icon {
      display: none;
    }

    .el-table td.el-table__expand-column {
      padding: 0
    }

    .el-breadcrumb__inner.is-link {
      @apply text-blue font-medium;
    }

    .el-button {
      @apply text-base;

      outline: none !important;
    }

    .download-btn {
      @apply ml-10;
    }

    .system-mapper {
      @apply pt-3;
    }

    .spec-layout {
      & > div {
        @apply pt-3;
      }
    }
  }
</style>
