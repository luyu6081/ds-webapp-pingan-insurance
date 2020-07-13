<template>
  <div class="essentials-map-card" @click.stop>
    <div class="essentials-map-card__header">{{info.title}}</div>
    <div class="essentials-map-card__body">
      <div class="input-group">
        <el-input placeholder="请输入..." v-model="keyword" :disabled="cardIndex === 1" @keyup.enter.native.stop="onSearch"></el-input>
        <i class="el-icon-search" @click.stop="onSearch"></i>
      </div>
      <div class="essentials-map-card__table">
        <template v-if="info.list.length">
          <div :class="['row', {'is-active': item['active']}]"
              v-for="(item, index) in info.list"
              :key="index"
              @click.stop="onRowClick(item, index)">
            <template v-for="(value, key) in item">
              <div v-if="key !== 'id' && key !== 'active'"
                  :key="key"
                  class="cell">{{ value || `&nbsp;`}}</div>
            </template>
          </div>
        </template>
        <no-data v-else></no-data>
      </div>
    </div>
  </div>
</template>

<script>
  import {
    Input as ElInput,
  } from 'element-ui'

  import NoData from '~/components/common/no-data'

  export default {
    props: {
      info: Object,
      cardIndex: Number,
    },
    components: {
      NoData,
      ElInput,
    },
    data () {
      return {
        keyword: null,
      }
    },
    methods: {
      onRowClick (item, index) {
        this.info.list.forEach(x => { x.active = false })
        item.active = true
        this.$emit('rowClick', {row: item, index: this.cardIndex})
      },
      onSearch () {
        this.$emit('search', {keyword: this.keyword, index: this.cardIndex})
      },
    },
  }
</script>

<style lang="scss">
  .essentials-map-card {
    @apply flex-1 flex-grow-0 bg-white;

    flex-basis: 30%;
    max-height: 210px;
    font-size: 14px;
    line-height: 22px;
    padding: 4px 12px 20px;
    box-sizing: border-box;
    box-shadow: 0 2px 10px 0 rgba(0,0,0,.1);
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    margin-right: 4px;

    &__header,
    &__body {
      box-sizing: border-box;
    }

    &__header {
      @apply text-black;

      padding-bottom: 4px;
    }

    &__body {
      border: 1px solid #E8E8E8;
      border-radius: 4px;
      box-sizing: border-box;
      background-color: #FAFAFA;
    }

    &__table {
      @apply text-center bg-white;

      height: 120px;
      overflow-x: hidden;
      overflow-y: auto;
      border-top: 1px solid #e8e8e8;
      min-width: 140px;
    }

    .input-group {
      @apply relative;

      padding: 4px 12px;

      .el-input__inner {
        height: 24px;
        line-height: 24px;

        &:hover,
        &:focus {
          @apply border-blue;
        }
      }
    }

    .el-icon-search {
      @apply inline-block absolute text-gray-dark;

      width: 12px;
      height: 12px;
      top: 10px;
      right: 20px;
      bottom: 6px;
    }

    .row {
      height: 30px;
      line-height: 30px;
      border-bottom: 1px solid #e8e8e8;
      font-size: 0;
      cursor: pointer;
      display: flex;
      flex-direction: row;

      &:first-of-type {
        border-top: none;
      }

      &.is-active {
        @apply text-gray-darker;

        background-color: #F5F5F5;
      }

      &:hover {
        @apply text-blue;
      }
    }

    .cell {
      flex: 1;
      padding: 0 5px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      box-sizing: border-box;
      font-size: 12px;
      border-right: 1px solid #e8e8e8;
      width: 100px;

      &:first-of-type {
        font-size: 14px;
      }

      &:last-of-type {
        border-right: none;
      }
    }
  }
</style>
