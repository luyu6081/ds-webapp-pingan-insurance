<template>
  <div v-if="statDetail" class="stat-specs-detail text-black">
    <div class="clearfix">
      <h3 class="float-left text-lg font-bold">{{statDetail.cnName}} ({{statDetail.enName}})</h3>
      <div class="float-right">
        <collect-and-watched v-model="collectWatchedObj" :operaId="statDetail.id || ''" type="DS_STATISTICS"/>
      </div>
    </div>
    <div class="mt-3">
      <span class="mr-6">标准ID：{{statDetail.standardId}}</span>
      <span>编号：{{statDetail.numberId}}</span>
    </div>
    <div class="group-col mt-3">
      <h5 class="font-bold mb-2">统计口径</h5>
      <p class="leading-loose">{{statDetail.content}}</p>
    </div>
  </div>
</template>

<script>
  import QUERY_STATISTICS_DETAIL from '~/graphql/query_statistics_detail.gql'

  import CollectAndWatched from '~/components/collectAndWatched'

  export default {
    name: 'StatSpecsDetailView',

    components: {
      CollectAndWatched,
    },

    props: {
      statId: {
        type: String,
        required: true,
      },
    },

    data () {
      return {
        statDetail: null,

        collectWatchedObj: {
          isCollect: false,
          isWatched: false,
        },
      }
    },

    created () {
      this.sendStatisticsDetailData(this.statId)
    },

    methods: {
      /**
       * 发送请求 获取统计详情数据
       */
      async sendStatisticsDetailData (statId) {
        const respData = await this.$apollo.query({
          query: QUERY_STATISTICS_DETAIL,
          fetchPolicy: 'network-only',
          variables: {id: statId},
        })

        const statisticsData = respData.data.statDetail

        if (statisticsData) {
          this.collectWatchedObj = {
            isCollect: statisticsData.isCollect,
            isWatched: statisticsData.isSubscribe,
          }
          this.statDetail = statisticsData
        }
      },
    },
  }
</script>
