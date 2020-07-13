<template>
  <div class="app-settings-view">
    <nav>
      <ul>
        <router-link tag="li"
                     class="nav-item"
                     v-for="(item, index) in menuList"
                     :key="index"
                     :to="`/app-settings/${item.path}`">{{ item.label }}</router-link>
      </ul>
    </nav>

    <router-view class="flex-1 app-settings-view__content"/>
  </div>
</template>

<script>
  export default {
    name: 'AppSettingsView',
    data () {
      return {
        menuList: [
          {label: '评分体系库', path: 'scoring-system'},
          {label: '标准评分管理', path: 'scoring-standards'},
        ],
      }
    },
  }
</script>

<style lang="scss">

  .app-settings-view {
    @apply flex flex-1;

    > nav {
      @apply flex-none bg-white;

      width: 240px;
      padding: 20px 0;
      margin-right: 2px;

      .nav-item {
        @apply text-lg cursor-pointer text-gray-darkest;

        padding: 0 24px;
        line-height: 50px;
        font-size: 14px;

        &.active {
          @apply text-blue bg-blue-lighter;

          border-right: 2px solid;
        }

        &:hover {
          @apply text-blue;
        }
      }
    }

    &__content {
      @apply bg-white;

      margin-left: 20px;
    }

    .el-dialog__wrapper {
      .el-button--primary {
        @apply bg-blue border-blue;
      }
    }
    .ej-search-input {
      height: 38px !important;
    }
  }
</style>
