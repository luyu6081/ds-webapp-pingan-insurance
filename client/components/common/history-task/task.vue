<template>
  <div class="detail-task-view">
    <display-info>
      <template #header>
        <ej-task-flow :data="taskList" class="header-list"/>
        <div class="icon-item">
          <ej-icon icon="notepad" @click="auditClick"/>审核
        </div>
      </template>

      <template #footer>
        <div class="list-block">
          <h3 class="title w-full">审批历史</h3>
          <!-- TODO: 用 ej-timeline 实现 -->
          <audit-history :options="historyList">
            <template #attachment="{options, content}">
              <attach-slot :options="options" :content="content"/>
            </template>
          </audit-history>
        </div>
      </template>
    </display-info>
  </div>
</template>

<script>
  import {Icon as EjIcon, TaskFlow as EjTaskFlow} from '@ej/ui'

  import AuditHistory from '~/components/audit-history.vue'
  import AttachSlot from './display-info/attach-slot.vue'
  import DisplayInfo from './display-info/index.vue'

  export default {
    name: 'DetailTask',

    components: {
      AttachSlot,
      AuditHistory,
      DisplayInfo,
      EjIcon,
      EjTaskFlow,
    },

    data () {
      return {
        taskList: [
          {
            title: '部门审核',
            type: 3,
            tasks: [
              {
                user_img: 'https://cdn.pixabay.com/photo/2019/02/04/09/56/boy-3974291__340.jpg',
                user_name: '王小虎',
                timestamp: '2018-05-15T00:00:00',
              },
            ],
          },
          {
            title: '财政部审核',
            type: 3,
            tasks: [
              {
                user_img: 'https://cdn.pixabay.com/photo/2019/02/04/09/56/boy-3974291__340.jpg',
                user_name: '李建刚',
                timestamp: '2018-05-15T00:00:00',
              },
            ],
          },
          {
            title: '市经信局审核',
            type: 3,
            tasks: [
              {
                user_img: 'https://cdn.pixabay.com/photo/2019/02/04/09/56/boy-3974291__340.jpg',
                user_name: '王小虎',
                timestamp: '2018-05-15T00:00:00',
              },
            ],
          },
          {
            title: '市委办局审核',
            type: 2,
            tasks: [
              {
                user_img: 'https://cdn.pixabay.com/photo/2019/02/04/09/56/boy-3974291__340.jpg',
                user_name: '李建刚',
                timestamp: '2018-05-15T00:00:00',
              },
            ],
          },
          {
            title: '待审核',
            type: 1,
          },
          {
            title: '发布',
            type: 1,
          },
        ],
        historyList: [
          {
            title: '工单初审',
            name: '张三',
            timestamp: '2019-01-10 18:00',
            duration: '0.1',
            img: require('@/assets/images/default_avatar.svg'),
            content: '审批意见内容展现1',
            // 附件信息
            attachment: [
              {
                type: 'doc',
                filename: 'word文件',
                stream: 'content-doc',
                size: '10.60kb',
                img: require('@/assets/images/default_avatar.svg'),
              },
              {
                type: 'html',
                filename: 'html文件',
                stream: 'content-html',
                size: '12.60kb',
                img: require('@/assets/images/default_avatar.svg'),
              },
            ],
          },
          {
            title: '工单初审',
            name: '李四',
            timestamp: '2019-01-10 18:00',
            duration: '0.1',
            img: require('@/assets/images/default_avatar.svg'),
            content: '审批意见内容展现2',
          },
        ],
      }
    },

    methods: {
      auditClick () {},
    },
  }
</script>

<style lang="scss">
  .detail-task-view {
    .header-list {
      padding: 14px 14px 0 14px;

      .ej-flow-item {
        margin-bottom: 0;
      }

      .title {
        margin-top: 10px;
      }
    }

    .display-info-view > .icon-item {
      @apply flex items-center text-blue cursor-pointer absolute;

      font-size: 12px;
      right: 20px;
      margin-top: 17px;

      .ej-icon {
        width: 15px;
        height: 18px;
        margin-right: 3px;
      }
    }
  }
</style>
