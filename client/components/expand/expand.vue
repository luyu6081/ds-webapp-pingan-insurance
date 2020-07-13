<template>
  <div class="expand-comp">
    <div class="expand-info" :style="{maxHeight: maxHeight + 'px'}">
      <div ref="dataExpand" class="overflow-hidden">
        <slot>暂无内容</slot>
      </div>
    </div>
    <div v-if="isShowExpendBtn" class="relative" >
      <div v-show="!currentExpendStatus" class="expand-btn" >
        <el-divider>
          <i class="el-icon-arrow-down mr-3 text-blue"></i>
          <span class="cursor-pointer text-blue" @click="handleExpand(1)">展开</span>
        </el-divider>
      </div>
      <div v-show="currentExpendStatus">
        <el-divider>
          <i class="el-icon-arrow-up mr-3 text-blue"></i>
          <span class="cursor-pointer text-blue" @click="handleExpand(0)">收起</span>
        </el-divider>
      </div>
    </div>
  </div>
</template>

<script>

  import {
    Divider as ElDivider,
  } from 'element-ui'

  export default {
    name: 'Expand',

    components: {
      ElDivider,
    },

    props: {
      maxHeight: {
        type: String,
        default: '340',
      },
    },

    data () {
      return {
        isShowExpendBtn: false, // 是否显示展开按钮
        currentExpendStatus: false, // 当前展开状态
      }
    },

    async mounted () {
      await this.$nextTick()
      this.resetSubjectMaxHeight()

      // 给所有的img绑定load进行对比
      let imgList = this.$el.querySelectorAll('img')
      if (imgList.length) {
        imgList.forEach((img) => {
          img.addEventListener('load', () => {
            this.resetSubjectMaxHeight()
          })
        })
      }
    },

    async updated () {
      await this.$nextTick()
      this.resetSubjectMaxHeight()
    },

    methods: {
      /**
       * 重置信息项标准maxHeight
       */
      resetSubjectMaxHeight () {
        let expandHeight = this.$refs.dataExpand.offsetHeight
        if (expandHeight) {
          if (expandHeight > this.maxHeight) {
            this.isShowExpendBtn = true
          }
        }
      },

      /**
       * 信息项标准，收起与展开
       * 展开-设置maxHeight值：整个列表的高度
       * 收起-设计maxHeight值：340px
       * @param {*} [isExpand] 1 - 展开 0 收起
       */
      handleExpand (isExpand) {
        if (isExpand) {
          this.$refs.dataExpand.parentNode.style.maxHeight = this.$refs.dataExpand.offsetHeight + 'px'
          this.currentExpendStatus = true
        } else {
          this.$refs.dataExpand.parentNode.style.maxHeight = this.maxHeight + 'px'
          this.currentExpendStatus = false
        }
      },
    },
  }
</script>

<style lang="scss">
  .expand-comp {
    .expand-btn {
      @apply relative;

      &::before {
        @apply absolute left-0 right-0;

        content: '';
        top: -80px;
        z-index: 18;
        background: linear-gradient(to top, #fff 19%, transparent);

        height: 66px;
      }
    }

    .expand-info {
      @apply overflow-hidden;

      transition: .5s;
    }
  }
</style>
