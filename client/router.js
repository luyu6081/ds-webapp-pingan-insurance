import {Message as ElMessage} from 'element-ui'

import Vue from 'vue'
import Router from 'vue-router'
import {
  Loading,
} from '@ej/ui'

Vue.use(Router)
Vue.use(Loading)
Vue.prototype.$message = ElMessage

function esm (importProm) {
  return importProm.then(m => m.default || m)
}

// const originalPush = Router.prototype.push
// Router.prototype.push = function push (location) {
//   return originalPush.call(this, location).catch(err => err)
// }

export function createRouter () {
  const router = new Router({
    mode: 'history',
    linkActiveClass: 'active',
    routes: [
      {
        path: '/',
        name: 'home',
        component: () => esm(import('~/pages/home/home.vue')),
      },
      {
        // 系统排行页
        path: '/system-ranking',
        name: 'system-ranking-page',
        component: () => esm(import('~/pages/home/system-ranking-detail.vue')),
      },
      {
        // 基础标准页
        path: '/essentials',
        name: 'essentials',
        component: () => esm(import('~/pages/essentials.vue')),
      },
      {
        // 统计标准列表页
        path: '/stat-specs',
        name: 'stat-specs',
        component: () => esm(import('~/pages/stat-specs.vue')),
      },
      {
        // 机构清单页
        path: '/organizations',
        name: 'organizations',
        component: () => esm(import('~/pages/organizations.vue')),
      },
      {
        // 公共代码列表页
        path: '/common-codes',
        name: 'common-codes',
        component: () => esm(import('~/pages/common-codes.vue')),
        meta: {
          keepAlive: true,
        },
      },
      {
        // 公共代码明细页
        path: '/common-code/:id',
        name: 'common-code',
        component: () => esm(import('~/pages/common-code/common-code-detail.vue')),
      },
      {
        // 新建指标管理
        path: '/index-manager/:indexId/:id',
        name: 'index-manager',
        component: () => esm(import('~/components/index-manager/detail')),
      },
      {
        // 统计标准详情页面
        path: '/index-manager-info/:id',
        name: 'index-manager-info',
        component: () => esm(import('~/components/index-manager/info')),
      },
      {
        // 统计标准列表
        path: '/index-manager-list',
        name: 'index-manager-list',
        component: () => esm(import('~/components/index-manager/list')),
      },
      {
        // 公共代码系统映射
        path: '/common-code/:id/sys-mapping',
        name: 'sys-mapping',
        component: () => esm(import('~/pages/common-code/common-code-sys-mapping.vue')),
      },
      {
        path: '/app-settings',
        name: 'app-settings',
        component: () => esm(import('~/pages/app-settings/index.vue')),
        children: [
          {
            path: '',
            redirect: 'scoring-system',
          },
          // {
          //   path: 'versions',
          //   component: require('~/pages/app-settings/views/versions.vue').default,
          //   meta: {
          //     authName: 'mdsSetting',
          //   },
          // },
          {
            path: 'scoring-system',
            name: 'scoring-system',
            component: () => esm(import('~/pages/app-settings/views/scoring-system.vue')),
            meta: {
              authName: 'mdsSetting',
            },
          },
          {
            path: 'scoring-standards',
            component: () => esm(import('~/pages/app-settings/views/scoring-standards.vue')),
            meta: {
              authName: 'mdsSetting',
            },
          },
        ],
      },
      // 标准审核
      {
        path: '/standard-audit',
        name: 'standard-audit',
        component: () => esm(import('~/pages/standard-audit')),
      },
      // 标准审核详情
      {
        path: '/standard-audit/:id',
        name: 'standard-audit-detail',
        component: () => esm(import('~/pages/standard-audit/detail')),
      },
      {
        path: '/common-version/:type/:id',
        name: 'common-version',
        component: () => esm(import('~/components/common/version')),
      },
      {
        path: '/stats-specs-detail/:id',
        name: 'stats-specs-detail',
        component: () => esm(import('~/components/stat-specs/detail')),
      },
      {
        path: '/organizations/:id',
        name: 'organizationsMappingList',
        component: () => esm(import('~/components/organizations/mapping-list')),
      },
      {
        path: '/common-code-detail',
        name: 'common-code-detail',
        component: () => esm(import('~/pages/common-code/detail')),
      },
      {
        path: '/common-code-map-create',
        name: 'commonCodeMapCreate',
        component: () => esm(import('~/pages/common-code/map-create')),
      },
      {
        path: '/common-code-detail-map',
        name: 'commonCodeDetailMap',
        component: () => esm(import('~/pages/common-code/detail-map')),
      },
      {
        path: '/detail-version',
        name: 'detail-version',
        component: () => esm(import('~/components/common/version/detail')),
      },
    ],
  })

  return router
}
