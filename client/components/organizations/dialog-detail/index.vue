<template>
  <el-dialog :title="title"
             :visible.sync="isVisible"
             :close-on-click-modal="false"
             append-to-body
             width="640px"
             :before-close="handleClose"
             class="organizations-dialog-detail">
    <!-- , 'question' -->
    <busi-buttons v-model="busiButtonsObj"
                  :show-button="['collect', 'watched']"
                  :title="info.cnName"
                  :operaId="info.id || ''"
                  :type="$parent.type"
                  class="inline-block mr-6"/>
    <div class="organizations-dialog-detail__content">
      <div v-for="(item, index) in organizationsList"
          :key="index"
          :class="['item', `is-${item.type}`]">
        <div class="item__label">{{ item.label }}：</div>
        <div class="item__value">{{ item.value }}</div>
      </div>
    </div>
    <div slot="footer">
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>

  import {
    Button as ElButton,
    Dialog as ElDialog,
  } from 'element-ui'

  import QUERY_DS_IS_COLLECT_SUBSCRIBE from '~/graphql/common/ds-is-collect-subscribe-query.gql'

  import BusiButtons from '~/components/busiButtons'

  import {organizationsList} from '~/components/organizations/dialog-edit/data'

  export default {
    props: {
      visible: Boolean,
      info: {
        type: Object,
        default: () => { return {} },
      },
    },
    components: {
      BusiButtons,
      ElButton,
      ElDialog,
    },
    data () {
      return {
        isVisible: false,
        organizationsList,
        busiButtonsObj: {
          isCollect: false,
          isWatched: false,
        },
      }
    },
    computed: {
      title () {
        return `${this.info.cnName}详情`
      },
    },
    methods: {
      initData () {
        this.organizationsList.forEach(x => {
          x.value = this.info[x.key]
        })
        this.getCollectData()
      },
      handleClose (done) {
        done()
        this.$emit('update:visible', false)
      },
      onConfirm () {
        this.$emit('update:visible', false)
      },

      async getCollectData () {
        const {id} = this.info
        const {type} = this.$parent
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_DS_IS_COLLECT_SUBSCRIBE,
          fetchPolicy: 'network-only',
          variables: {
            id,
            type,
          },
        })
        const {isCollect, isSubscribe: isWatched} = data
        this.busiButtonsObj = {
          isCollect,
          isWatched,
        }
      },
    },
    watch: {
      'visible' (newVal) {
        this.isVisible = newVal
        this.initData()
      },
    },
  }
</script>

<style lang="scss">
  .organizations-dialog-detail {
    .common-buttons {
      @apply absolute;

      margin-right: 0;
      right: 20px;
    }

    &__content {
      @apply flex flex-row flex-wrap;

      padding-top: 30px;

      .item {
        @apply flex flex-row text-gray-darkest;

        line-height: 22px;
        margin-bottom: 16px;
        font-size: 14px;

        &.is-text {
          flex-basis: 33.33%;
        }

        &.is-textarea {
          flex-basis: 100%;

          .item__value {
            max-width: 500px;
            white-space: normal;
          }
        }

        &__label {
          @apply text-right;

          width: 70px;
        }

        &__value {
          @apply flex-1 text-gray-darker;

          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          max-width: 120px;
          padding-right: 10px;
          box-sizing: border-box;
        }
      }
    }
  }
</style>
