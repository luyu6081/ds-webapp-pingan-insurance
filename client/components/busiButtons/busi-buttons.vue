<template>
  <div class="common-buttons" :class="{'common-buttons-more': showButton.length > 1, 'is-disabled': disabled}">
    <a v-if="showButtn('launch')" href="javascript:" class="btn-opera" @click="handleLaunch">
      <ej-icon :icon="isLaunch ? 'play-circle-o' : 'pause-circle-o'" :class="['inline-block mr-1', isLaunch ? 'text-blue' : 'text-gray-dark']"/>
      <span :class="[isLaunch ? 'text-blue' : 'text-gray-dark']">{{isLaunch ? '启用' : '停用'}}</span>
    </a>
    <a v-if="showButtn('collect')" href="javascript:" class="btn-opera" @click="handleCollect">
      <ej-icon :icon="isCollect ? 'star' : 'star-o'" class="inline-block mr-1"/>
      <span>{{isCollect ? '已收藏' : '收藏'}}</span>
    </a>
    <a v-if="showButtn('watched')" href="javascript:" class="btn-opera" @click="handleWatched">
      <ej-icon :icon="isWatched ? 'pin' : 'pin-o'" class="inline-block mr-1"/>
      <span>{{isWatched ? '已订阅' : '订阅'}}</span>
    </a>
    <a v-if="showButtn('import')" href="javascript:" class="btn-opera" @click.stop="onHandler('import')">
      <ej-icon icon="import" class="inline-block mr-1"/>
      <span>下载</span>
    </a>
    <a v-if="showButtn('question')" href="javascript:" class="btn-opera">
      <ej-icon icon="question-circle-o" class="inline-block mr-1"/>
      <span>提问</span>
    </a>
    <a v-if="showButtn('edit')" href="javascript:" class="btn-opera" @click.stop="onHandler('edit')">
      <ej-icon icon="edit" class="inline-block mr-1"/>
    </a>
    <a v-if="showButtn('remove')" href="javascript:" class="btn-opera" @click.stop="onHandler('remove')">
      <ej-icon icon="trash" class="inline-block mr-1"/>
    </a>
    <div v-if="showButtn('add')" class="btn-opera btn-border border-gray-light btn-add" @click.stop="onHandler('add')">
      <ej-icon icon="plus" class="inline-block mr-1"/>
      <span>添加</span>
    </div>
    <div v-if="showButtn('new')" class="btn-opera btn-border border-blue-light" @click.stop="onHandler('new')">
      <ej-icon icon="plus" class="inline-block mr-1"/>
      <span>新建</span>
    </div>
  </div>
</template>

<script>
  import {
    Icon as EjIcon,
  } from '@ej/ui'

  import Message from '~/utils/message'
  import MUTATION_COLLECT_OPERA from '~/graphql/collect_opera.gql'
  import MUTATION_WATCHED_OPERA from '~/graphql/watched_opera.gql'

  export default {
    name: 'BusiButtons',
    components: {
      EjIcon,
    },

    model: {
      prop: 'value',
      event: 'change',
    },

    props: {
      disabled: {
        type: Boolean,
        default: false,
      },
      showButton: {
        type: Array,
      },
      value: {
        type: Object,
        default: () => {},
      },
      operaId: {
        type: String,
      },
      type: {
        type: String,
      },
      title: String,
    },

    computed: {
      // 启用 停用
      isLaunch: {
        get () {
          return this.value.isLaunch
        },
        set (val) {
          this.$set(this.value, 'isLaunch', val)
        },
      },

      // 未收藏 已收藏
      isCollect: {
        get () {
          return this.value.isCollect
        },
        set (val) {
          this.$set(this.value, 'isCollect', val)
        },
      },

      // 未订阅 已订阅
      isWatched: {
        get () {
          return this.value.isWatched
        },
        set (val) {
          this.$set(this.value, 'isWatched', val)
        },
      },
    },

    methods: {
      /**
       * 判断按钮是否展示
       */
      showButtn (btnName) {
        return this.showButton.includes(btnName)
      },

      handleLaunch () {
        if (this.disabled) return
        // this.value.isLaunch = !this.value.isLaunch
        this.$emit('click', {command: 'lauch', value: this.value.isLaunch})
      },

      handleCollect () {
        if (this.disabled) return
        let operations = !this.value.isCollect
        this.$apollo.mutate({
          mutation: MUTATION_COLLECT_OPERA,
          variables: {
            dsObjectId: this.operaId,
            isOperations: operations,
            type: this.type,
            title: this.title,
          },
          update: (store, {data: {watchedOpera}}) => {
            this.value.isCollect = !this.value.isCollect
            Message.MessageSuccess({messageSuccessText: this.value.isCollect ? '收藏成功' : '已取消收藏'})
          },
        })
      },

      handleWatched () {
        if (this.disabled) return
        let operations = !this.value.isWatched

        this.$apollo.mutate({
          mutation: MUTATION_WATCHED_OPERA,
          variables: {
            dsObjectId: this.operaId,
            isOperations: operations,
            type: this.type,
            title: this.title,
          },
          update: (store, {data: {watchedOpera}}) => {
            this.value.isWatched = !this.value.isWatched
            Message.MessageSuccess({messageSuccessText: this.value.isWatched ? '订阅成功' : '已取消订阅'})
          },
        })
      },

      onHandler (type) {
        if (this.disabled) return
        this.$emit('click', type)
      },
    },
  }
</script>

<style lang="scss">
  .common-buttons {
    @apply inline-block text-blue text-sm;

    cursor: pointer;

    &.is-disabled {

      &,
      a {
        color: #999;
        cursor: not-allowed;
      }
    }

    &-more {
      .btn {
        &-opera {
          margin-left: 14px;
        }
      }
    }

    .btn {
      &-border {
        @apply border border-dashed rounded;
      }
      &-add {
        padding: 3px 13px;
        max-width: 74px;
      }
    }

    svg {
      width: 14px;
      height: 14px;
      margin-top: -2px;
    }
  }
</style>
