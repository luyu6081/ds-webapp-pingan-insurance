<template>
  <div class="standard-audit-list">
    <el-tabs v-model="activeTab">
      <el-tab-pane v-for="(item, index) in paneList"
                   :key="index"
                   :label="`${item.label}${item.total !== null ? `(${item.total})`: ''}`"
                   :name="item.name">
        <list-panel ref="panel" :panel-type="item.name"></list-panel>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
  import {
    Tabs as ElTabs,
    TabPane as ElTabPane,
  } from 'element-ui'

  import {mapGetters, mapActions} from 'vuex'

  import ListPanel from '~/components/standard-audit/list-panel'

  export default {
    components: {
      ListPanel,
      ElTabs,
      ElTabPane,
    },
    computed: {
      ...mapGetters({
        'paneList': 'audit/paneList',
      }),
      activeTab: {
        get () {
          return this.$store.state.audit.activeTab
        },
        set (newVal) {
          this.setActiveTab(newVal)
        },
      },
    },
    methods: {
      ...mapActions({
        'setActiveTab': 'audit/setActiveTab',
      }),
    },
  }
</script>

<style lang="scss">
  .standard-audit-list {
    @apply bg-white flex-1;

    margin: 0 auto;
    padding: 20px 30px;
  }
</style>
