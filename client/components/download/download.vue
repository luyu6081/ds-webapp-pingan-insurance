<template>
  <div>
    <span v-if="isInlineElement" class="text-blue mx-2"  @click="download">下载</span>
    <div v-else class="download-comp text-blue mt-3 cursor-pointer" @click="download">
      <ej-icon icon="import" class="inline-block mr-1"/>下载
    </div>
  </div>
</template>

<script>
  import {
    Icon as EjIcon,
  } from '@ej/ui'

  import QUERY_DOWNLOAD_LIST from '~/graphql/query_download_list.gql'
  import QUERY_DOWNLOAD_DETAIL from '~/graphql/query_download_detail.gql'

  export default {
    name: 'DownloadComp',
    components: {
      EjIcon,
    },

    props: {
      isInlineElement: {
        type: Boolean,
        default: false,
      },
      buisinessType: String, // 基础标准DS_STANDARD, 公共代码DS_CODE, 机构清单DS_INSTITUTIONAL, 统计数据DS_STATISTICS
      fileType: String,
      downloadType: String, // 下载场景，[LIST] 列表下载，[DETAIL] 详情下载
      buisinessField: Object, // 业务字段，如：下载列表需要keyWord 下载详情需要id
    },

    data () {
      return {
        type: {
          downloadList: 'LIST',
          downloadDetail: 'DETAIL',
        },
      }
    },

    methods: {
      download () {
        let params = {}

        if (this.downloadType === this.type.downloadList) { // 列表
          params = {
            keyWord: this.buisinessField ? this.buisinessField.keyWord : '',
            fileTypeEnum: this.fileType,
            serverTypeEnum: this.buisinessType,
          }
          this.downloadList(params)
        } else { // 详情
          params = {
            id: this.buisinessField.id,
            fileTypeEnum: this.fileType,
            serverInfoTypeEnum: this.buisinessType,
          }
          this.downloadDetail(params)
        }
      },

      async downloadList (params) {
        const {data: {exportList}} = await this.$apollo.query({
          query: QUERY_DOWNLOAD_LIST,
          variables: {...params},
        })

        this.handleALinkClick(exportList)
      },

      async downloadDetail (params) {
        const {data: {exportInfo}} = await this.$apollo.query({
          query: QUERY_DOWNLOAD_DETAIL,
          variables: {...params},
        })

        this.handleALinkClick(exportInfo)
      },

      handleALinkClick (downloadUrl) {
        const downloadElement = document.createElement('a')
        downloadElement.href = downloadUrl
        downloadElement.download = downloadUrl
        document.body.appendChild(downloadElement)
        downloadElement.click()
        document.body.removeChild(downloadElement)
        window.URL.revokeObjectURL(downloadUrl)
      },
    },
  }
</script>

<style lang="scss">
  .download-comp {
    svg {
      width: 19px;
      height: 19px;
    }
  }
</style>
