<template>
  <div class="spec-layout relative">
    <div class=" bg-gray-lighter overflow-hidden z-20"
         :class="[fixedLayout ? 'fixed inset-x-0 fixed__auto' : '']">
      <div class="up-area bg-white clearfix bg-white p-6">
        <ej-search-input v-model="keywords" height="40" placeholder="请输入" @search="search"/>
        <div class="float-right">
          <slot name="searchRightArea"/>
        </div>
      </div>
    </div>
    <div class="down-area bg-white mb-6 p-6">
      <slot name="downArea"/>
    </div>
  </div>
</template>

<script>

  import {
    SearchInput as EjSearchInput,
  } from '@ej/ui'

  export default {
    name: 'SpecLayout',

    components: {
      EjSearchInput,
    },

    props: {
      loadMore: {
        type: Boolean,
        default: false,
      },
      fixedLayout: {
        type: Boolean,
        default: false,
      },
    },

    data () {
      return {
        keywords: '',
        isLoadMore: false,
        prevScrollTop: 0, // 记录滚动条上一次滚动的位置，chrome浏览器会一直停在底部导致无限加载
      }
    },

    watch: {
      'keywords' () {
        this.$emit('keyword-change', this.keywords)
      },
    },

    mounted () {
      if (this.loadMore) {
        window.addEventListener('scroll', this.scroll, true)
      }
    },

    updated () {
      this.$nextTick(() => {
        if (this.loadMore && this.isLoadMore) {
          document.documentElement.scrollTop = document.body.scrollTop = this.prevScrollTop
        }
      })
    },

    destroyed () {
      if (this.loadMore) {
        window.removeEventListener('scroll', this.scroll, true)
      }
    },

    methods: {
      search (arg) {
        this.$emit('search', arg)
      },

      scroll () {
        let scrollTop = document.documentElement.scrollTop || document.body.scrollTop
        let windowHeight = document.documentElement.clientHeight || document.body.clientHeight
        let scrollHeight = document.body.scrollHeight
        if (this.isLoadMore) {
          setTimeout(() => { this.isLoadMore = false }, 100)
        }
        if (!this.isLoadMore && scrollTop + windowHeight >= scrollHeight) {
          this.isLoadMore = true
          this.$emit('load-more')
          this.prevScrollTop = scrollTop
        }
      },
    },
  }
</script>

<style lang="scss">
  .el-input__inner:hover,
  .el-input__inner:focus {
    @apply border-blue;
  }

  .fixed.fixed__auto {
    left: 25px;
    right: 25px;
  }
</style>
