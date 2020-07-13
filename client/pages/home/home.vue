<template>
  <div class="home-view w-page flex">
    <div v-ej-loading="$apollo.queries.newStandardData.loading ||
                      $apollo.queries.essentialsStandardData.loading" class="left flex-auto">
      <!-- 数据专题 -->
      <data-subject :content="dataSubject"/>

      <!-- 最新发布的标准 -->
      <standard-block title="最新发布的标准" :standardData="newStandardData || []" class="standard-block-first">
        <template #default="{data}">
          <new-standard-item :itemData="data.item"/>
        </template>
      </standard-block>

      <!-- 基础标准分类 -->
      <standard-block title="基础标准分类" :standardData="essentialsStandardData || []">
        <template #default="{data}">
          <essentials-standard-item :itemData="data.item"/>
        </template>
      </standard-block>

      <!-- 公共代码分类 -->
      <standard-block title="公共代码分类" :standardData="commonCodeStandardData || []">
        <template #default="{data}">
          <common-code-standard-item :itemData="data.item"/>
        </template>
      </standard-block>

      <!-- 最近浏览的标准 -->
      <standard-block title="最近浏览的标准" :standardData="browseStandardData || []" class="pb-4">
        <template #default="{data}">
          <browse-standard-item :itemData="data.item"/>
        </template>
      </standard-block>
    </div>

    <div v-ej-loading="$apollo.queries.statInfoItemData.loading" class="right flex-none">
      <!-- 信息项统计 -->
      <global-stat-info :data="statInfoItemData || {}"/>
      <!-- 数据标准执行度系统排行 -->
      <system-ranking :data="systemRanking"/>
      <!-- 热词搜索 -->
      <hot-word v-if="defaultWords" :word-data="defaultWords" @search="handleSearch" @word-cloud="handleWordCloud"/>
    </div>
    <el-backtop class="z-50" :bottom="20"><i class="el-icon-thumb"></i></el-backtop>
  </div>
</template>

<script>

  import {
    Backtop as ElBacktop,
  } from 'element-ui'

  import DataSubject from '~/components/home-comp/datasubject'
  import SystemRanking from '~/components/home-comp/system-ranking'
  import StandardBlock from '~/components/home-comp/standard-list-block'
  import NewStandardItem from '~/components/home-comp/standard-item/new-standard-item'
  import EssentialsStandardItem from '~/components/home-comp/standard-item/essentials-standard-item'
  import BrowseStandardItem from '~/components/home-comp/standard-item/browse-standard-item'
  import CommonCodeStandardItem from '~/components/home-comp/standard-item/common-code-standard-item'
  import GlobalStatInfo from '~/components/home-comp/global-stat-info'
  import HotWord from '~/components/home-comp/hotword/hotword'

  import QUERY_COMMON_CODE_CLASSIFICATION from '@/graphql/query_home_common_code_classifications.gql'
  import QUERY_HOT_WORD_LIST from '@/graphql/query_hot_word_list.gql'
  import QUERY_NEWST_STANDARDS from '~/graphql/query_home_newst_standards.gql'
  import QUERY_BASIC_STANDARDS_CLASSIFICATION from '~/graphql/query_home_basic_standards_classification.gql'
  import QUERY_BROWSE_STANDARDS from '~/graphql/query_home_browse_standards.gql'
  import QUERY_STAT_INFO_ITEM from '~/graphql/query_home_statistical_info_item.gql'
  // import QUERY_SUBJECT_DATA from '~/graphql/query_subject_data.gql'
  import QUERY_SYSTEM_RANK_DATA from '~/graphql/query_system_rank_data.gql'

  const MockSubject = () => {
    return `<div><img src="${require('~/assets/banner.jpg')}" onerror="javascript:this.src='/noPic.gif';" alt="pic"/><p>
      大数据平台从2019年1月启动，在大数据平台建设中，数据标准的参考模型直接构成大数据平台逻辑数据模型（LDM）的核心内容和骨架，
      并实现了数据标准落地。在标准落地范围内，代码已落地61%；信息项已落地76%；预计在建系统（全流程和中小系统）加载完成后，在落地范围内，
      实现信息项和代码100%落地。 大数据平台从2019年1月启动，在大数据平台建设中，数据标准的参考模型直接构成大数据平台逻辑数据模型（LDM）
      的核心内容和骨架， 并实现了数据标准落地。在标准落地范围内，代码已落地61%；信息项已落地76%；预计在建系统（全流程和中小系统）
      加载完成后，在落地范围内，实现信息项和代码100%落地。</p></div>`
  }

  export default {
    name: 'HomeView',

    components: {
      ElBacktop,
      DataSubject,
      SystemRanking,
      StandardBlock,
      NewStandardItem,
      EssentialsStandardItem,
      BrowseStandardItem,
      CommonCodeStandardItem,
      GlobalStatInfo,
      HotWord,
    },

    data () {
      return {
        keyWord: '',
      }
    },

    apollo: {
      // 最新发布的标准
      newStandardData: {
        query: QUERY_NEWST_STANDARDS,
        fetchPolicy: 'network-only',
        update: data => data.newstStandards,
      },

      // 基础标准分类
      essentialsStandardData: {
        query: QUERY_BASIC_STANDARDS_CLASSIFICATION,
        fetchPolicy: 'network-only',
        update: data => data.basicStandardClassifications,
      },

      // 最新浏览的标准
      browseStandardData: {
        query: QUERY_BROWSE_STANDARDS,
        fetchPolicy: 'network-only',
        update: data => data.browseStandards,
      },

      // 统计信息项数据
      statInfoItemData: {
        query: QUERY_STAT_INFO_ITEM,
        fetchPolicy: 'network-only',
        update: data => data.statInfoItem,
      },

      // 数据标准执行度系统排行
      systemRanking: {
        query: QUERY_SYSTEM_RANK_DATA,
        fetchPolicy: 'network-only',
        update: data => data.systemRanking,
      },

      // 公共代码分类
      commonCodeStandardData: {
        query: QUERY_COMMON_CODE_CLASSIFICATION,
        fetchPolicy: 'network-only',
        update: data => data.commonCodeClassifications,
      },

      // 获取检索热词
      defaultWords: {
        query: QUERY_HOT_WORD_LIST,
        fetchPolicy: 'network-only',
        update: data => data.homeHotWords,
      },

      // // 数据专题
      // dataSubject: {
      //   query: QUERY_SUBJECT_DATA,
      //   fetchPolicy: 'network-only',
      //   update: data => data.subjectData,
      // },
    },

    created () {
      this.dataSubject = MockSubject()
    },

    methods: {
      handleSearch (arg) {
        console.log('arg', arg)
      },
      handleWordCloud (wordObj) {
        console.log('word-cloud', wordObj)
      },
    },
  }
</script>

<style lang="scss">

.app__content {
  .home-view {
    width: 1100px;
  }
}

  .home-view {
    padding-top: 20px;
    padding-bottom: 30px;
    margin: 0 auto;

    > .left {
      width: 680px;
      margin-right: 20px;

      .standard-block-first{
        padding-top: 21px;
        margin-top: 20px;
      }
    }

    > .right {
      width: 416px;

      > * {
        margin-top: 20px;

        &:first-child {
          margin-top: 0;
        }
      }
    }
  }
</style>
