<template>
  <div id="app" class="bg-gray-lighter overflow-hidden">
    <!-- 海盒-->
    <ej-app-header title="数据标准" :logo="require('~/assets/logo.svg')" :user="userData" fixed>
      <ej-nav-menu mode="horizontal"
                   :default-active="activeIndex"
                   text-color="#fff"
                   active-text-color="#fff"
                   class="app-nav"
                   @select="handleSelect">
        <template v-for="(menu, pindex) in menuList">
          <el-menu-item v-if="!menu.children"
                        :index="`${pindex + 1}`"
                        :key="pindex"
                        class="flex items-center"
                        @click="onMenuItemClick(menu)">
            <span>{{ menu.label }}</span>
          </el-menu-item>
          <ej-nav-submenu v-if="menu.children"
                          :key="pindex"
                          :index="`${pindex + 1}`"
                          class="flex items-center">
            <template #title>{{ menu.label }}</template>
            <el-menu-item v-for="(subMenu, sindex) in menu.children"
                          :key="sindex"
                          :index="`${pindex + 1}-${sindex + 1}`"
                          @click="onMenuItemClick(subMenu)">
              <span>{{ subMenu.label }}</span>
            </el-menu-item>
          </ej-nav-submenu>
        </template>
      </ej-nav-menu>

      <template #tray>
        <!-- <ej-app-search/> -->
        <!-- app-settings -->
        <ej-app-setting @click.native="$router.push('/app-settings')"/>
        <!-- <ej-app-notification/> -->
        <app-usermenu :user="userData" :endpoint="fileDownloadAddress"/>
      </template>
    </ej-app-header>

    <div v-ej-loading.fullScreen="!loading" class="app__content">
      <nuxt :keep-alive="$route.meta.keepAlive" :key="$route.fullPath"/>
    </div>
  </div>
</template>

<script>

  import {
    MenuItem as ElMenuItem,
  } from 'element-ui'

  import {
    AppUsermenu,
    AppHeader as EjAppHeader,
    // AppNotification as EjAppNotification,
    // AppSearch as EjAppSearch,
    AppSetting as EjAppSetting,
    NavMenu as EjNavMenu,
    NavSubmenu as EjNavSubmenu,
  } from '@ej/ui'

  import runtimeArgs from '~/runtime-args'

  /** 政策法规-跳转KC系统地址 */
  // const JUMP_KC_ADDRESS = process.env.NUXT_ENV_KC_ENDPOINT_HTTP

  // /** 下载地址 */
  // const FILE_DOWNLOAD_ADDRESS = runtimeArgs.NUXT_ENV_DOWNLOAD_ENDPOINT_HTTP

  // /** 登录地址 */
  // const LOGIN_URL_ADDRESS = runtimeArgs.NUXT_ENV_LOGIN_URL

  // /** UC 地址 */
  // const UC_URL_ADDRESS = runtimeArgs.NUXT_ENV_AUTH_HTTP_ENDPOINT

  export default {
    name: 'DS',

    components: {
      // ElMenu,
      ElMenuItem,
      // EjAppNotification,
      // EjAppSearch,
      AppUsermenu,
      EjNavMenu,
      EjNavSubmenu,
      EjAppSetting,
      EjAppHeader,
    },

    data () {
      return {
        activeIndex: '1',
        menuList: [
          {label: '首页', name: 'home'},
          {label: '标准内容',
           children: [
             {label: '基础标准', name: 'essentials'},
             {label: '统计标准', name: 'index-manager-list'},
             // {label: '统计标准', name: 'stat-specs'},
             {label: '机构清单', name: 'organizations'},
             {label: '公共代码', name: 'common-codes'},
           ]},
          {label: '标准审核', name: 'standard-audit'},
          // {label: '更多',
          //  children: [
          //    {label: '政策法规', href: JUMP_KC_ADDRESS},
          //  ]},
        ],
      }
    },

    computed: {
      userData () {
        return this.$nuxt.$app.state.me
      },

      loading () {
        return Object.keys(this.userData).length
      },

      fileDownloadAddress () {
        return {
          avatarUrl: runtimeArgs.NUXT_ENV_DOWNLOAD_ENDPOINT_HTTP, // FILE_DOWNLOAD_ADDRESS,
          loginUrl: runtimeArgs.NUXT_ENV_LOGIN_URL, // LOGIN_URL_ADDRESS,
          ucUrl: runtimeArgs.NUXT_ENV_AUTH_HTTP_ENDPOINT, // UC_URL_ADDRESS,
          client: 'auth',
        }
      },
    },

    created () {
      this.initMenuActive()
    },

    async mounted () {
      await this.$store.dispatch('categoriesTechList')
    },

    methods: {
      onMenuItemClick (menu) {
        const {children, name, href} = menu
        if (!children) {
          if (name) {
            if (name === 'standard-audit') {
              this.$store.dispatch('audit/setActiveTab', 'OPEN')
            }
            this.$router.push({name})
          } else if (href) {
            window.open(href, '_blank')
          }
        }
      },
      initMenuActive () {
        const menuNav = {
          'home': '1',
          'essentials': '2-1',
          'stat-specs': '2-2',
          'organizations': '2-3',
          'common-codes': '2-4',
          'common-code': '2-4',
          'sys-mapping': '2-4',
          'val-mapping': '2-4',
        }
        this.activeIndex = menuNav[this.$route.name || this.$store.state.currentRouteName]
      },

      handleSelect (key, keyPath) {
        // console.log(key, keyPath)
      },
    },
  }
</script>

<style lang="scss">
  body {
    @apply min-h-full bg-gray-lighter;
  }

  #app {
    @apply flex flex-col;

    min-height: 100vh;
  }

  .app {
    &__content {
      @apply flex-1 flex flex-grow;

      box-sizing: border-box;
      margin: 0 25px 20px;
      min-width: 1100px;

      &>div {
        width: 100%;
      }
    }
  }

  .ej-app-header {
    @apply fixed z-20;

    min-width: 1100px;
  }

  .app-nav {
    margin-left: 100px !important;
  }

  .el-table {
    .el-table__header-wrapper tr th {
      @apply bg-gray-lightest text-gray-darkest;
    }
    td, th {
      padding: 10px 0;
    }
  }
</style>
