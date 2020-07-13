<template>
  <div class="hot-word bg-white py-5 relative" style="height: 270px;">
    <div class="px-5 pb-2">
      <ej-search-input v-model="keywords"
                       width="100%"
                       height="34"
                       placeholder="请输入"
                       @search="(arg) => $emit('search', arg)"/>
    </div>
    <div class="cloudWrap">
      <word-chart :wordData="wordData"
                  :width="400"
                  :height="200"
                  @word-cloud="(data) => $emit('word-cloud', data)"
        />
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'

  import {SearchInput} from '@ej/ui'

  import EjEchartsWord from './echarts-wordcloud.vue'

  Vue.use(SearchInput)

  export default {
    name: 'HotWord',

    props: {
      wordData: {
        type: Array,
        required: true,
      },
    },

    components: {
      'word-chart': EjEchartsWord,
    },

    data () {
      return {
        keywords: '',
      }
    },
  }
</script>

<style lang="scss">
  .hot-word {
    margin-top: 5px;
    .el-input__inner:hover,
    .el-input__inner:focus {
      @apply border-blue;
    }
    .cloudWrap {
      @apply w-full cursor-pointer;

      height: 210px;
    }
  }
</style>
