<template>
  <div class="sys-mapping-view bg-white min-h-screen flex-auto pb-6">
    <div class="el-breadcrumb-wrap">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item>标准内容</el-breadcrumb-item>
        <el-breadcrumb-item :to="{name: 'common-codes'}">公共代码列表</el-breadcrumb-item>
        <el-breadcrumb-item>{{commonCodeCnName}}</el-breadcrumb-item>
        <el-breadcrumb-item>系统映射</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="pt-20">
      <div class="bg-white flex-auto flex">
        <div class="left-menu block flex-none fixed text-base z-10 m-0 left-0 bottom-0 border-r border-solid border-gray-lighter overflow-y-auto">
          <ej-search-input v-model="keywords"
                           width="228"
                           height="32"
                           placeholder="请输入"
                           @search="handleSearch"/>
          <h3 class="mt-4 text-black text-base font-bold"><i class="el-icon-square"></i>系统名称</h3>
          <div class="ml-8 border-l border-dashed border-gray-light mt-3 mb-4 text-gray-darker pl-6 pt-1">
            <div v-for="(item, idx) in sysMenuList"
                 :key="item.id"
                 class="relative sys-item mt-3 cursor-pointer"
                 @click="goAnchor(idx)">
              <i class="el-icon-document mr-3 text-blue"></i>
              <span class="py-1 px-2" :class="{'bg-blue-lighter': activeMenu === idx}">{{item.systemName}}</span>
            </div>
          </div>
          <p v-if="!this.sysMenuList.length" class="text-gray text-center">暂无该系统</p>
        </div>
        <div v-if="mappingConditionData" id="syscontent" class="sys-mapping-content block flex-auto">
          <MappingTable v-for="item in mappingConditionData"
                        :key="item.id"
                        :id="'anchor' + item.id"
                        class="anchor-list mt-16"
                        :mapping-info="item"
                        :merge-cell-data="getMergeCellsIndex(item.mappingList)"
                        @code-mapper="handleSysMapper"/>
        </div>
      </div>
    </div>

    <el-dialog :title="codeMappingDialogTitle" :visible.sync="dialogTableVisible" width="1100px" append-to-body>
      <div class="flex">
        <div class="flex-auto w-1/3 mx-4">
          <el-table :data="codeMapperData[0]">
            <el-table-column property="standardName" label="标准名称"></el-table-column>
            <el-table-column property="standardCoding" label="标准编码" width="100"></el-table-column>
            <el-table-column property="systemCoding" label="系统编码" width="100"></el-table-column>
          </el-table>
        </div>

        <div class="flex-auto w-1/3 mx-4">
          <el-table :data="codeMapperData[1]">
            <el-table-column property="standardName" label="标准名称"></el-table-column>
            <el-table-column property="standardCoding" label="标准编码" width="100"></el-table-column>
            <el-table-column property="systemCoding" label="系统编码" width="100"></el-table-column>
          </el-table>
        </div>

        <div class="flex-auto w-1/3 mx-4">
          <el-table :data="codeMapperData[2]">
            <el-table-column property="standardName" label="标准名称"></el-table-column>
            <el-table-column property="standardCoding" label="标准编码" width="100"></el-table-column>
            <el-table-column property="systemCoding" label="系统编码" width="100"></el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>

  import {
    Breadcrumb as ElBreadcrumb,
    BreadcrumbItem as ElBreadcrumbItem,
    Dialog as ElDialog,
    Table as ElTable,
    TableColumn as ElTableColumn,
  } from 'element-ui'

  import {
    SearchInput as EjSearchInput,
  } from '@ej/ui'

  import QUERY_COMMONCODE_SYSTEM_MAPPING from '~/graphql/query_commoncode_system_mapping.gql'
  import QUERY_COMMONCODE_FIELD_MAPPING from '~/graphql/query_commoncode_field_mapping.gql'
  import QUERY_COMMONCODE_CN_NAME from '~/graphql/query_commoncode_cn_name.gql'
  import MappingTable from '~/components/common-code/sys-mapping-table.vue'

  export default {
    name: 'SysMappingView',

    components: {
      ElBreadcrumb,
      ElBreadcrumbItem,
      ElDialog,
      ElTable,
      ElTableColumn,
      MappingTable,
      EjSearchInput,
    },

    data () {
      return {
        activeMenu: 0,
        keywords: '',
        menuList: [],
        sysMenuList: [],

        dialogTableVisible: false,
        codeMapperData: [], // 代码映射 分组数据
        codeSourceData: [], // 代码映射 原始数据

        mappingConditionData: {},

        scroll: 0, // 存储滚动条的高度

        codeMappingDialogTitle: '', // 代码映射模态框标题

        isWatchScroll: true,

        commonCodeCnName: '',
      }
    },

    apollo: {
      systemMappingData: {
        query: QUERY_COMMONCODE_SYSTEM_MAPPING,
        fetchPolicy: 'network-only',
        variables () {
          return {
            id: this.$route.params.id,
          }
        },
        update (data) {
          const commonCodeSystemMapping = data.commonCodeSystemMapping
          if (commonCodeSystemMapping && commonCodeSystemMapping.systemMapping.length > 0) {
            // 监听数据，合并行
            this.mappingConditionData = commonCodeSystemMapping.systemMapping
            this.mappingConditionData.map(d => {
              this.menuList.push({
                id: d.id,
                systemName: d.systemName,
              })
            })

            this.sysMenuList = this.menuList
          }
        },
      },
    },

    watch: {
      scroll () { // 用来监听data中的scroll字符串的变化
        if (this.isWatchScroll) {
          this.loadSroll()
        }
      },
    },

    created () {
      if (this.$route.params.codeCnName) {
        this.commonCodeCnName = this.$route.params.codeCnName
      } else {
        this.sendCnName()
      }
    },

    mounted () {
      window.addEventListener('scroll', this.handleScrollTop, true)
    },

    destroyed () {
      window.removeEventListener('scroll', this.handleScrollTop, true)
    },

    methods: {
      /**
       * 获取滚动条的高度
       */
      handleScrollTop () {
        this.scroll = document.documentElement.scrollTop || document.body.scrollTop
      },

      loadSroll () {
        let anchorArr = document.querySelectorAll('.anchor-list')
        let sysItemArr = document.querySelectorAll('.sys-item')

        for (let i = 0; i < anchorArr.length; i++) {
          if (this.scroll + 400 >= anchorArr[i].offsetTop) {
            // 获取左侧滚动条的高度
            let distance = document.querySelector('.left-menu').scrollTop
            let leftMenuClientHeight = document.querySelector('.left-menu').clientHeight

            if (sysItemArr[i].offsetTop > leftMenuClientHeight - 50) {
              document.querySelector('.left-menu').scrollTop = distance + sysItemArr[i].offsetTop
            } else {
              document.querySelector('.left-menu').scrollTop = distance - sysItemArr[i].offsetTop
            }

            this.activeMenu = i
          }
        }
      },

      goAnchor (index) {
        this.isWatchScroll = false // 当点击左侧菜单时，取消watch，为了解决点击左侧菜单时 与右侧内容 步调不一致问题

        this.activeMenu = index

        let anchorArr = document.querySelectorAll('.anchor-list') // 获取右边的div数组

        let divOffsetTop = anchorArr[index].offsetTop // 获取第index个div的offsetTop距离
        let distance = document.documentElement.scrollTop || document.body.scrollTop // 获取滚动条的高度

        // 把总距离分成50个小段，每4ms执行一次
        let step = 0
        const copies = 30

        if (divOffsetTop > distance) {
          let _offsetTop = divOffsetTop - distance // 当div到窗口的距离 大于 滚动条的距离，向下滑动，此时滑动的距离是divOffsetTop - distance
          step = _offsetTop / copies
          slideDown() // 向下滑动
        } else {
          let _offsetTop = distance - divOffsetTop // 当div到窗口的距离 小于 滚动条的距离，向上滑动，此时滑动的距离是distance - divOffsetTop
          step = _offsetTop / copies
          slideUp()
        }

        // 向下滑动
        function slideDown () {
          if (distance < divOffsetTop) {
            distance += step
            document.body.scrollTop = document.documentElement.scrollTop = distance - 120
            setTimeout(slideDown, 3)
          } else {
            document.body.scrollTop = document.documentElement.scrollTop = divOffsetTop - 120
          }
        }

        // 向上滑动
        function slideUp () {
          if (distance > divOffsetTop) {
            distance -= step
            document.body.scrollTop = document.documentElement.scrollTop = distance - 120
            setTimeout(slideUp, 3)
          } else {
            document.body.scrollTop = document.documentElement.scrollTop = divOffsetTop - 120
          }
        }

        setTimeout(() => { // 当点击左侧菜单动作完成后 && 页面滚动动作完成后，恢复watch
          this.isWatchScroll = true
        }, 1000)
      },

      handleSearch (...args) {
        let keyword = args[0]

        this.sysMenuList = this.menuList.filter(data => !args[0] ||
          data.systemName.toLowerCase().includes(keyword.toLowerCase()))
      },

      async handleSysMapper (rows) {
        this.codeSourceData = []

        await this.sendFieldMappingValues(rows.fieldId)
        await this.carveCodeMappingData()
        this.codeMappingDialogTitle = `${rows.dbName} ${rows.tableName}.${rows.fieldName} 系统映射值`

        setTimeout(() => {
          this.dialogTableVisible = true
        })
      },

      /**
       * 发送请求 获取代码映射数据
       */
      async sendFieldMappingValues (fieldId) {
        const respData = await this.$apollo.query({
          query: QUERY_COMMONCODE_FIELD_MAPPING,
          fetchPolicy: 'network-only',
          variables: {
            id: fieldId,
          },
        })
        const fieldMapping = respData.data.commonCodeFieldMapping
        if (fieldMapping && fieldMapping.mappingValues) {
          this.codeSourceData = fieldMapping.mappingValues
        }
      },

      /**
       * 代码映射，将数据长度 按比例切割三等份
       */
      carveCodeMappingData () {
        const dataLength = this.codeSourceData.length // 原生数据的长度
        const subGroupLength = 3 // 子组的长度

        let contentLength = dataLength % subGroupLength === 0 ? dataLength / subGroupLength : parseInt((dataLength / subGroupLength) + '') + 1
        let index = 0 // 起始
        this.codeMapperData = []
        while (index < dataLength) {
          this.codeMapperData.push(this.codeSourceData.slice(index, index += contentLength))
        }
      },

      /**
       * 获取合并单元格的索引集合 [库]列与[表]列
       * @param {Array} [data] 平铺表格数据
       */
      getMergeCellsIndex (data) {
        let libraryIndex = 0 // 库索引
        let tableIndex = 0 // 表索引

        let currentMerge = [[], []]

        for (var i = 0; i < data.length; i++) {
          // 默认第一组数据是一行
          if (i === 0) {
            currentMerge[0].push(1)
            currentMerge[1].push(1)

            libraryIndex = 0
            tableIndex = 0
          } else {
            // 判断库名与上一个库名是否相同
            if (data[i].dbName === data[i - 1].dbName) {
              currentMerge[0][libraryIndex] += 1
              currentMerge[0].push(0)
            } else {
              currentMerge[0].push(1)
              libraryIndex = i
            }

            // 判断库名与上一个库名是否相同 且 判断表名与上一个表名是否相同
            if (data[i].dbName === data[i - 1].dbName && data[i].tableName === data[i - 1].tableName) {
              currentMerge[1][tableIndex] += 1
              currentMerge[1].push(0)
            } else {
              currentMerge[1].push(1)
              tableIndex = i
            }
          }
        }

        return currentMerge
      },

      /**
       * 获取当前公共代码的中文名称
       *
       * 目前作用：为了解决用户刷新页面时，页面的面包屑导航为空问题
       */
      async sendCnName () {
        console.log('this.$route.params.id', this.$route.params.id)
        const respData = await this.$apollo.query({
          query: QUERY_COMMONCODE_CN_NAME,
          fetchPolicy: 'network-only',
          variables: {
            id: this.$route.params.id,
          },
        })

        const commonCodeCnName = respData.data.commonCodeCnName

        if (commonCodeCnName) {
          this.commonCodeCnName = commonCodeCnName.cnName
        }
      },
    },
  }
</script>

<style lang="scss">
  .sys-mapping-view {
    button {
      outline: none !important;
    }

    .el-table td, .el-table th {
      padding: 10px 0;
    }

    .el-table__header-wrapper tr th {
      @apply text-black;
    }

    .left-menu {
      @apply pt-4 pl-6;

      width: 270px;
      top: 100px;
      box-sizing: border-box;
    }

    .el-button {
      @apply block;
    }

    .sys-mapping-content {
      margin-left: 300px;
    }

    .el-breadcrumb__inner.is-link {
      @apply text-blue font-medium;
    }

    .el-breadcrumb-wrap {
      // pt-6
      @apply fixed z-20 bg-gray-lighter inset-x-0 overflow-hidden border-b border-solid border-gray;

      .el-breadcrumb {
        @apply bg-white py-5 pl-6;
      }
    }

    .el-icon-square {
      @apply border border-solid border-gray text-sm mr-3 text-gray overflow-hidden inline-block;

      width: 10px;
      height: 10px;

      &:before {
        @apply block border-t border-solid border-gray;

        content: '';
        width: 10px;
        height: 10px;
        margin-top: 3px;
      }
    }

    .sys-item {
      &::before {
        @apply absolute inline-block border-t border-dashed border-gray;

        content: '';
        left: -18px;
        top: 9px;
        width: 16px;
        height: 6px;
      }

      span:hover {
        @apply bg-blue-lighter;

        transition: .1s;
      }
    }
  }
</style>
