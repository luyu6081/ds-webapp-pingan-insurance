<template>
  <el-popover v-model="visible" placement="bottom" trigger="click">
    <div class="attach-slot-content">
      {{content}}
      <div v-show="optionsLen">
        <p class="text-gray mt-2">附件({{optionsLen}})：</p>
        <div class="flex">
          <div v-for="(item, index) in options"
               :key="index"
               class="cursor-pointer item-block text-center"
               @click="DownloadFileStream(item)">
            <img v-if="['jpg', 'jpeg', 'gif', 'png', 'bmp'].indexOf(item.type) !== -1" :src="item.img" class="img"/>
            <ej-icon v-else icon="textfile" class="icon-file"/>
            <p>{{`${item.filename}.${item.type}`}}</p>
            <p class="text-gray">{{item.size}}</p>
          </div>
        </div>
      </div>
    </div>
    <span slot="reference" class="cursor-pointer ml-3 text-blue">{{text}}</span>
  </el-popover>
</template>

<script>

  import {
    Popover as ElPopover,
  } from 'element-ui'

  import {
    Icon as EjIcon,
  } from '@ej/ui'

  export default {
    name: 'attachment',
    components: {
      ElPopover,
      EjIcon,
    },

    props: {
      options: {
        type: Array,
        default: () => [],
      },
      content: {
        type: String,
        default: '',
      },
    },

    data () {
      return {
        visible: false,
      }
    },

    computed: {
      text () {
        return this.visible ? '收起' : '展开'
      },

      optionsLen () {
        return this.options.length
      },
    },

    methods: {
      DownloadFileStream (item) {
        console.log('item.img', item)
        window.open(item.img)
      },
    },
  }
</script>

<style lang="scss">
  .attach-slot-content {
    line-height: 24px;
    font-size: 12px;

    .item-block {
      margin-right: 15px;

      &:last-of-type {
        margin-right: 0;
      }

      .img, .icon-file{
        width: 100px;
        height: 100px;
        margin: 0 auto;
      }
    }
  }
</style>
