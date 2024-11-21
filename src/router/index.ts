import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      title: 'Dashboard',
      icon: 'PieChartOutlined'
    }
  },
  {
    path: '/inventory',
    name: 'Inventory',
    redirect: '/inventory/hostgroups',
    meta: {
      title: 'Inventory管理',
      // icon: 'pie-chart-outlined',
      icon: 'DatabaseOutlined',
    },
    children: [
      {
        path: 'hostgroups',
        component: () => import('@/views/inventory/HostGroups.vue'),
        meta: {
          title: '主机组管理'
        }
      },
      {
        path: 'hosts',
        component: () => import('@/views/inventory/Hosts.vue'),
        meta: {
          title: '主机管理'
        }
      }
    ]
  },
  {
    path: '/adhoc',
    name: 'Adhoc',
    component: () => import('@/views/Adhoc.vue'),
    meta: {
      title: 'Ad-hoc模式',
      // icon: 'desktop-outlined'
      icon: 'DesktopOutlined'
    }
  },
  {
    path: '/playbook',
    name: 'Playbook',
    component: () => import('@/views/Playbook.vue'),
    meta: {
      title: 'Playbook模式',
      // icon: 'desktop-outlined'
      icon: 'ContainerOutlined'
    }
  },
  {
    path: "/tasks",
    name: "Tasks",
    component: () => import("@/views/Tasks.vue"),
    meta: {
      title: "任务管理",
      // icon: "team-outlined"
      icon: "HistoryOutlined"
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: {
      title: '系统设置',
      // icon: 'setting-outlined'
      icon: 'SettingOutlined'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：设置页面标题
router.beforeEach((to, from, next) => {
  const title = to.meta.title
  if (title) {
    document.title = `${title} - Ansible Web UI`
  }
  next()
})

export default router