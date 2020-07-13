<template>
  <div class="essentials-map">
    <div :class="['essentials-map__value', {'is-disabled': disabled}]" @click="onCardToggle" v-domOff="visible">
      <el-tag v-for="(item, index) in tagInfo"
              :key="index"
              type="info"
              closable
              size="mini"
              @close="onRemove(index)">
        {{ item }}
      </el-tag>
    </div>
    <div class="essentials-map__card" v-show="visible">
      <map-card v-for="(item, index) in cardList"
                :key="index"
                :info="item"
                :card-index="index"
                @search="onSearch"
                @rowClick="onRowClick"
                ref="card"></map-card>
    </div>
  </div>
</template>

<script>
  import {
    Tag as ElTag,
  } from 'element-ui'

  import MapCard from '~/components/essentials/map/map-card'

  import QUERY_MDS_SEARCH from '~/graphql/essentials/mds-search-query.gql'
  import QUERY_MDS_LOAD_MDS_OBJECT from '~/graphql/essentials/mds-load-mds-object-query.gql'
  import QUERY_STANDARD_DQS_LOAD_SCHEDULE_LIST from '~/graphql/standard/dqs/dqs-load-schedule-list-query.gql'

  export default {
    props: {
      value: Array,
      list: Array,
      cardList: Array,
    },
    model: {
      prop: 'value',
      event: 'update',
    },
    computed: {
      disabled () {
        return this.list.length === 0
      },
    },
    components: {
      MapCard,
      ElTag,
    },
    directives: {
      domOff: {
        bind (el, binding, vnode, oldVnode) {
          el.handler = function () {
            vnode.context[binding.expression] = false
          }

          el.stopProp = function (event) {
            event.stopPropagation()
          }

          el.addEventListener('click', el.stopProp)
          document.body.addEventListener('click', el.handler)
        },
        unbind (el, binding, vnode, oldVnode) {
          el.removeEventListener('click', el.stopProp)
          document.body.removeEventListener('click', el.handler)
        },
      },
    },
    data () {
      return {
        // 表1个，字段1个，规则多个
        techCategoryId: null,
        curVal: [],
        tagInfo: [],
        visible: false,
      }
    },
    methods: {
      onCardToggle (e) {
        if (e) {
          this.$emit('mapToggleBefore', this.visible)
        }
        if (this.disabled) return
        this.visible = !this.visible
      },
      computedTagInfo () {
        const tableItem = this.cardList.filter(x => x.title === '表')[0]
        const selItem = this.cardList.filter(x => x.title === '检查规则')[0]
        if (tableItem) { // 表
          if (this.curVal.length !== 1) {
            const tagInfo = this.curVal.map(x => x.name).join('/')
            this.tagInfo = tagInfo ? [tagInfo] : []
            if (this.tagInfo.length && this.visible) {
              this.onCardToggle()
            }
            this.$emit('update', this.curVal)
          }
        } else if (selItem) { // 查检规则
          if (this.cardList.length > 0) {
            this.tagInfo = this.curVal.map(x => x.name)
            if (this.tagInfo.length && this.visible) {
              this.onCardToggle()
            }
            this.$emit('update', this.curVal)
          }
        }
      },
      onSearch ({keyword, index}) { // index 0
        const tableItem = this.cardList.filter(x => x.title === '表')[0]
        const selItem = this.cardList.filter(x => x.title === '检查规则')[0]
        if (tableItem) { // 表
          this.mdsSearch(keyword)
        } else if (selItem) { // 检查规则
          this.getDqsScheduleList(keyword)
        }
      },
      onRowClick ({row, index}) {
        const tableItem = this.cardList.filter(x => x.title === '表')[0]
        const selItem = this.cardList.filter(x => x.title === '检查规则')[0]
        if (tableItem) {
          this.curVal[index] = row
          if (index === 0) { // 表
            this.mdsLoadMdsObject(row)
            this.curVal.splice(1, 1) // 清空字段值
          }
        } else if (selItem) { // 检查规则
          // 不存在添加，存在删除
          const fIndex = this.curVal.findIndex(x => x.id === row.id)
          if (fIndex > -1) {
            this.curVal.splice(fIndex, 1)
          } else {
            this.curVal.push(row)
          }
        }
        this.computedTagInfo()
      },
      // 规则
      async getDqsScheduleList (keyword = '') {
        const input = {
          // applyId: this.techType[0],
          // systemId: this.techType[1],
          // databaseId: this.techType[2],
          keyword,
          limit: 10,
          offset: 0,
          type: 'ALL',
        }
        let {data: {data: {data}}} = await this.$apollo.query({
          query: QUERY_STANDARD_DQS_LOAD_SCHEDULE_LIST,
          fetchPolicy: 'network-only',
          variables: {
            input,
          },
        })
        data = data || []
        let list = []
        const reg = /<\/?\w+[^>]+\>/ig // eslint-disable-line
        const selItem = this.cardList.filter(x => x.title === '检查规则')[0]
        data.map(x => {
          list.push({
            id: x.id,
            name: x.name.replace(reg, ''),
            active: selItem && this.curVal[0] && this.curVal[0].id === x.id,
          })
        })
        if (selItem.list) {
          selItem.list = list
        }
      },
      // 字段
      async mdsLoadMdsObject (item) {
        const variables = {
          mdsObjectId: item.id,
        }
        let {data: {data}} = await this.$apollo.query({
          query: QUERY_MDS_LOAD_MDS_OBJECT,
          fetchPolicy: 'network-only',
          variables,
        })
        let {mdsColumns} = data
        mdsColumns = mdsColumns || []
        let list = []
        mdsColumns.map(x => {
          const {id, name, desc} = x
          list.push({
            id,
            name,
            desc,
            active: this.curVal[1] && this.curVal[1].id === id,
          })
        })
        const selItem = this.cardList.filter(x => x.title === '字段')[0] || {}
        if (selItem.list) {
          selItem.list = list
        }
      },
      // 表
      async mdsSearch (keyword) {
        const input = {
          techCategoryId: this.techCategoryId,
          offset: 0,
          size: 9999999,
        }
        if (keyword) {
          input.keyword = keyword
        }
        let {data: {data: {data}}} = await this.$apollo.query({
          query: QUERY_MDS_SEARCH,
          fetchPolicy: 'network-only',
          variables: {
            input,
          },
        })
        data = data || []
        let list = []
        data.map(x => {
          const {id, name, chineseName} = x
          list.push({
            id,
            name: name.replace(/\<\/?em\>/ig, ''), // eslint-disable-line
            chineseName,
            active: this.curVal[0] && this.curVal[0].id === id,
          })
        })
        const selItem = this.cardList.filter(x => x.title === '表')[0] || {}
        if (selItem.list) {
          selItem.list = list
        }
      },
      onRemove (index) {
        const tableItem = this.cardList.filter(x => x.title === '表')[0]
        const selItem = this.cardList.filter(x => x.title === '检查规则')[0]
        if (tableItem) { // 表
          this.curVal.splice(0, 2)
        } else if (selItem) { // 查检规则
          this.curVal.splice(index, 1)
        }
        this.computedTagInfo()
        // 清空列表选中样式
        this.cardList.map(c => {
          c.list.map(x => { x.active = false })
        })
      },
      updateList () {
        this.$emit('update', this.curVal)
      },
    },
    watch: {
      'value': {
        handler (newVal) {
          this.curVal = newVal
          this.computedTagInfo()
        },
        immediate: true,
        deep: true,
      },
    },
  }
</script>

<style lang="scss">
  .essentials-map {
    @apply relative;

    &__value {
      min-height: 32px;
      line-height: 21px;
      width: 407px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      box-sizing: border-box;
      padding: 3px 8px;
      max-height: 100px;
      overflow-x: hidden;
      overflow-y: auto;

      &:hover {
        @apply border-blue;
      }

      &.is-disabled {
        background-color: #f5f7fa;
        border-color: #e4e7ed;
        color: #c0c4cc;
        cursor: not-allowed;
      }

      .el-tag {
        @apply relative align-middle;

        max-width: 370px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        padding-right: 16px;
        margin: 2px 0;

        .el-tag__close {
          @apply absolute;

          right: 2px;
          top: 2px;
        }
      }
    }

    &__card {
      @apply flex flex-row absolute;

      z-index: 10;
      top: calc(100% - 1px);
    }

    .essentials-map-card {
      &:first-of-type {
        .cell {
          width: 140px;
        }
      }
    }

    .el-tag {
      margin-right: 12px;
      // margin: 5px 6px;

      &--mini {
        height: 22px;
        line-height: 21px;
      }
    }
  }
</style>
