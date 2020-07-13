<template>
  <div class='common-version-essentials' v-ej-loading.fullscreen='loading'>
    <div class='common-version-essentials__header'>
      <el-breadcrumb separator='/'>
        <el-breadcrumb-item v-for='(item, index) in menuList'
                            :key='index'
                            :to='{ name: item.name, params: item.params, query: item.query }'>{{ item.label }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <common-card :info='basicInfo' :bg='bg'></common-card>
    <!-- 基础标准 信息项标准 -->
    <div v-if="this.type === 'STANDARD'"
         class='common-version-essentials__content'>
      <h3>信息项标准</h3>
      <div class="tag-wrap">
        <el-tag v-for="(item, index) in attributes"
                :key="index"
                :class="[{'active': index === activeIndex}]"
                @click="onOperate(index)">{{ item.cnName }}</el-tag>
      </div>
      <div class="attribute-list"
           v-for="(item, index) in attributeItem"
           :key="index">
        <h4>{{ item.label }}</h4>
        <essentials-detail-card :list="item.list"></essentials-detail-card>
      </div>
    </div>
    <!-- 指标标准 -->
    <div v-if="this.type === 'STATISTICS'"
         class='common-version-essentials__content'>
      <div class="attribute-list"
           v-for="(item, index) in basicInfo.typeList"
           :key="index">
        <h4>{{ item.label }}</h4>
        <essentials-detail-card :list="item.list"></essentials-detail-card>
      </div>
    </div>
  </div>
</template>

<script>

  import {
    Breadcrumb as ElBreadcrumb,
    BreadcrumbItem as ElBreadcrumbItem,
    Tag as ElTag,
  } from 'element-ui'

  import {formatDate} from '~/utils/date'

  import QUERY_DS_HISTORY from '~/graphql/history/ds-history-query.gql'

  import CommonCard from '~/components/common/version/card'
  import EssentialsDetailCard from '~/components/essentials/detail-card'

  import {levelList} from '~/pages/essentials.data'
  import {VERSION_DETAIL} from '~/components/common/version/detail/data'

  export default {
    components: {
      ElBreadcrumb,
      ElBreadcrumbItem,
      ElTag,
      CommonCard,
      EssentialsDetailCard,
    },
    computed: {
      bg () {
        return this.type === 'STANDARD' ? 'essentials' : 'bg-white'
      },
      standardId () {
        const {standardId} = this.$route.query
        return standardId
      },
      loading () {
        return this.loadingCount !== 0
      },
      menuList () {
        if (!this.type) return []
        const {label, name} = this.VERSION_DETAIL[this.type]
        const {contentObj} = this.info
        let title
        if (contentObj) {
          title = contentObj.cnName
        }
        const menuList = [
          {label, name},
          {label: '历史版本', name: 'common-version', params: {id: this.standardId, type: this.type}},
          {label: title, name: 'detail-version', query: {id: this.id, type: this.type, standardId: this.standardId}},
        ]
        return menuList
      },
      attributeItem () {
        const curAttr = this.attributes[this.activeIndex]
        const attributes = JSON.parse(JSON.stringify(this.VERSION_DETAIL[this.type].attributes))
        if (curAttr) {
          attributes[0].list.forEach(x => {
            const {key} = x
            if (key === 'manager') {
              x.value = curAttr[key] && curAttr[key].name
            } else if (key === 'level') {
              x.value = levelList[curAttr[key]]
            } else {
              x.value = curAttr[key]
            }
          })
          attributes[1].list.forEach(x => {
            const {key} = x
            if (key === 'commonCode') {
              x.value = curAttr[key] && curAttr[key].id
            } else {
              x.value = curAttr[key]
            }
          })
        }
        return attributes
      },
    },
    data () {
      return {
        VERSION_DETAIL,
        type: null,
        loadingCount: 0,
        id: null,
        info: {},
        basicInfo: {},
        attributes: [],
        activeIndex: 0,
      }
    },
    mounted () {
      this.init()
    },
    methods: {
      async init () {
        const {id, type} = this.$route.query
        this.id = id
        this.type = type
        this.loadingCount++
        let {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_HISTORY,
          fetchPolicy: 'network-only',
          variables: {
            id: this.id,
          },
        })
        this.loadingCount--
        data = JSON.parse(JSON.stringify(data || {}))
        data.contentObj = JSON.parse(data.content)
        const {version, contentObj} = data
        const {VERSION_DETAIL} = this
        let list = []
        if (type !== 'STATISTICS') {
          list = VERSION_DETAIL[type].basicList.map(x => {
            const {key} = x
            if (key === 'manager') {
              x.value = contentObj[key] && contentObj[key].name
            } else {
              x.value = contentObj[key]
            }
            return x
          })
        } else {
          list = VERSION_DETAIL[type].typeList.map(t => {
            t.list.forEach(x => {
              const {key} = x
              if (key === 'manager' || key === 'presenter' || key === 'applyUser') {
                x.value = contentObj[key] && contentObj[key].name
              } else if (key === 'statisticalTime') {
                x.value = contentObj[key] && formatDate(new Date(contentObj[key]))
              } else if (key === 'dimensions') {
                let value = ''
                if (contentObj[key] && contentObj[key].length) {
                  value = contentObj[key][0].name
                }
                x.value = value
              } else if (key === 'dataSystem') {
                let value = ''
                if (contentObj['platformName'] && contentObj['systemName'] && contentObj['dbName']) {
                  value = `${contentObj['platformName']}/${contentObj['systemName']}/${contentObj['dbName']}`
                }
                x.value = value
              } else {
                x.value = contentObj[key]
              }
              return x
            })
            return t
          })
        }

        let basicInfo = {
          version,
          ...data.contentObj,
        }
        if (type !== 'STATISTICS') {
          basicInfo.list = list
        } else {
          basicInfo.typeList = list
        }
        this.basicInfo = basicInfo
        const {attributes} = contentObj
        this.activeIndex = 0
        this.info = data
        this.attributes = attributes || []
      },
      onOperate (index) {
        this.activeIndex = index
      },
    },
  }
</script>

<style lang='scss'>
  .common-version-essentials {
    @apply flex-1;

    &__header {
      background-color: #ecf2fc;
      padding-left: 24px;
      box-sizing: border-box;
      height: 50px;
      line-height: 50px;

      .el-breadcrumb {
        &__item {
          @apply text-gray-darkest;

          font-size: 14px;
        }
      }
    }

    &__content {
      @apply bg-white;

      padding: 16px 24px;
      box-sizing: border-box;

      h3 {
        @apply text-gray-darkest;

        font-size: 16px;
        font-weight: 600;
        line-height: 24px;
      }

      .el-tag {
        @apply text-blue border-none cursor-pointer;

        margin: 12px 10px;
        background-color: #f5f8ff;
        font-size: 14px;
        line-height: 22px;
        padding: 5px 12px;
        box-sizing: border-box;

        &:first-of-type {
          margin-left: 0;
        }

        &.active {
          @apply text-white bg-blue;
        }
      }

      .attribute-list {

        h4 {
          @apply text-gray-darkest;

          font-size: 14px;
          font-weight: 600;
          line-height: 22px;
          margin-bottom: 13px;
        }
      }
    }
  }
</style>
