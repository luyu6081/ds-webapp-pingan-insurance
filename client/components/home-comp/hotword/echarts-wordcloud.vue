<template>
  <div class="wordcloud-wrap">
    <word-chart ref='wordCloud'
                flex
                :options="setOptions()"
                auto-resize
                @click="wordClickHandler"/>
  </div>
</template>

<script>
  import ECharts from 'vue-echarts/components/ECharts'
  import 'echarts-wordcloud'

  export default {
    name: 'EjEchartsWord',

    props: {
      wordData: {
        type: Array,
        required: true,
      },
      width: {
        type: Number,
        default: 400,
      },
      height: {
        type: Number,
        default: 200,
      },
    },

    components: {
      'word-chart': ECharts,
    },

    data () {
      return {
        myColors: ['#ff6a6a', '#ffcc3f', '#4ec189', '#477de9', '#8e45ff', '#ccc'],
      }
    },

    methods: {
      wordClickHandler (item) {
        const _data = item.data
        this.$emit('word-cloud', {name: _data.name, value: _data.value})
      },

      /**
       * min ≤ r ≤ max
       */
      getRandomNums (min, max) {
        return Math.round(Math.random() * (max - min)) + min
      },

      setOptions () {
        return {
          tooltip: {},
          series: [{
            type: 'wordCloud',
            gridSize: 4,
            sizeRange: [12, 26],
            rotationRange: [0, 0],
            shape: 'square',
            width: this.width,
            height: this.height,
            drawOutOfBound: false,
            textStyle: {
              normal: {
                color: () => {
                  return this.myColors[this.getRandomNums(0, 5)]
                },
              },
              emphasis: {
                shadowBlur: 10,
                shadowColor: '#ccc',
              },
            },
            data: this.wordData || [],
          }],
        }
      },
    },
  }
</script>

<style lang="scss">
  .wordcloud-wrap {
    .echarts {
      width: 400px;
      height: 200px;
    }
  }
</style>
