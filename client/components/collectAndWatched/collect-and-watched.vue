<template>
  <div class="collect-watched text-blue text-normal">
    <a href="javascript:" class="mr-6" @click="handleCollect">
      <ej-icon :icon="isCollect ? 'star' : 'star-o'" class="inline-block mr-1"/>
      <span>{{isCollect ? '已收藏' : '收藏'}}</span>
    </a>
    <a href="javascript:" @click="handleWatched">
      <ej-icon :icon="isWatched ? 'pin' : 'pin-o'" class="inline-block mr-1"/>
      <span>{{isWatched ? '已订阅' : '订阅'}}</span>
    </a>
  </div>
</template>

<script>

  import {
    Icon as EjIcon,
  } from '@ej/ui'

  import Message from '@/utils/message'
  import MUTATION_COLLECT_OPERA from '@/graphql/collect_opera.gql'
  import MUTATION_WATCHED_OPERA from '@/graphql/watched_opera.gql'

  export default {
    name: 'CollectAndWatchedComp',

    components: {
      EjIcon,
    },

    model: {
      prop: 'collectWatchedObj',
      event: 'change',
    },

    props: {
      collectWatchedObj: {
        type: Object,
        default: () => {},
      },
      operaId: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
    },

    computed: {
      isCollect: {
        get () {
          return this.collectWatchedObj.isCollect
        },
        set (val) {
          this.$set(this.collectWatchedObj, 'isCollect', val)
        },
      },
      isWatched: {
        get () {
          return this.collectWatchedObj.isWatched
        },
        set (val) {
          this.$set(this.collectWatchedObj, 'isWatched', val)
        },
      },
    },

    methods: {
      handleCollect () {
        let operations = !this.collectWatchedObj.isCollect
        this.$apollo.mutate({
          mutation: MUTATION_COLLECT_OPERA,
          variables: {
            dsObjectId: this.operaId,
            isOperations: operations,
            type: this.type,
          },
          update: (store, {data: {watchedOpera}}) => {
            this.collectWatchedObj.isCollect = !this.collectWatchedObj.isCollect
            Message.MessageSuccess({messageSuccessText: this.collectWatchedObj.isCollect ? '收藏成功' : '已取消收藏'})
          },
        })
      },

      handleWatched () {
        let operations = !this.collectWatchedObj.isWatched

        this.$apollo.mutate({
          mutation: MUTATION_WATCHED_OPERA,
          variables: {
            dsObjectId: this.operaId,
            isOperations: operations,
            type: this.type,
          },
          update: (store, {data: {watchedOpera}}) => {
            this.collectWatchedObj.isWatched = !this.collectWatchedObj.isWatched
            Message.MessageSuccess({messageSuccessText: this.collectWatchedObj.isWatched ? '订阅成功' : '已取消订阅'})
          },
        })
      },
    },
  }
</script>

<style lang="scss">
  .collect-watched {
    svg {
      width: 17px;
      height: 17px;
      margin-top: -2px;
    }
  }
</style>
