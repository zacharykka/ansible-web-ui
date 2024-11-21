<template>
  <a-layout-sider v-model:collapsed="collapsed" collapsible theme="light">
    <div class="logo">
      <img src="@/assets/logo.png" alt="logo" />
    </div>
    <a-menu v-model:selectedKeys="selectedKeys" theme="light" mode="inline">
      <template v-for="route in menuRoutes" :key="route.path">
        <!-- Regular menu items -->
        <a-menu-item
          v-if="!route.children"
          :key="`menu-item-${route.path}`"
          @click="navigateTo(route.path)"
        >
          <component :is="getIcon(<string>route.meta?.icon)" />
          <span>{{ route.meta?.title }}</span>
        </a-menu-item>

        <!-- Submenu items -->
        <a-sub-menu v-else :key="`sub-menu-${route.path}`">
          <template #title>
            <span>
              <component :is="getIcon(<string>route.meta?.icon)" />
              <span>{{ route.meta?.title }}</span>
            </span>
          </template>
          <a-menu-item
            v-for="child in route.children"
            :key="`${route.path}/${child.path}`"
            @click="navigateTo(`${route.path}/${child.path}`)"
          >
            {{ child.meta?.title }}
          </a-menu-item>
        </a-sub-menu>
      </template>
    </a-menu>
  </a-layout-sider>
</template>

<script lang="ts" setup>
import {
  DesktopOutlined,
  DatabaseOutlined,
  ContainerOutlined,
  AreaChartOutlined,
  SettingOutlined,
  HistoryOutlined,
  PieChartOutlined,
} from "@ant-design/icons-vue";
import { computed, ref } from "vue";
import { useRouter, RouteRecordRaw } from "vue-router";

defineOptions({
  name: "Sidebar",
});

const router = useRouter();
const collapsed = ref<boolean>(false);

// Update selectedKeys based on current route
const selectedKeys = computed(() => {
  const currentPath = router.currentRoute.value.path;
  const menuKey = currentPath.startsWith("/") ? currentPath : `/${currentPath}`;

  // For regular menu items
  if (
    menuRoutes.value.some((route) => !route.children && route.path === menuKey)
  ) {
    return [`menu-item-${menuKey}`];
  }

  // For submenu items
  for (const route of menuRoutes.value) {
    if (route.children) {
      for (const child of route.children) {
        const fullPath = `${route.path}/${child.path}`;
        if (menuKey === fullPath) {
          return [`${route.path}/${child.path}`];
        }
      }
    }
  }

  return [];
});

// Recursive function to transform routes to menu items
const transformRouteToMenuItem = (
  route: RouteRecordRaw
): RouteRecordRaw | null => {
  // Skip routes without title
  if (!route.meta?.title) {
    return null;
  }

  const menuItem = { ...route };

  // Process children recursively
  if (route.children?.length) {
    const children = route.children
      .map(transformRouteToMenuItem)
      .filter((child): child is RouteRecordRaw => child !== null);

    if (children.length) {
      menuItem.children = children;
    }
  }

  return menuItem;
};

// Get menu routes using the recursive function
const menuRoutes = computed(() => {
  return router.options.routes
    .map(transformRouteToMenuItem)
    .filter((route): route is RouteRecordRaw => route !== null);
});

// Map icon names to components
const getIcon = (iconName?: string) => {
  const icons = {
    AreaChartOutlined,
    PieChartOutlined,
    DesktopOutlined,
    DatabaseOutlined,
    ContainerOutlined,
    HistoryOutlined,
    SettingOutlined,
  };
  return icons[iconName as keyof typeof icons] || AreaChartOutlined;
};

const navigateTo = (path: string) => {
  router.push(path);
};
</script>
<style lang="less">
#components-layout-demo-side .logo {
  height: 32px;
  margin: 16px;
  // background: rgba(255, 255, 255, 0.3);
  background: rgba(230, 220, 220, 0.3);
}

.logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* padding: 16px; */
}
</style>
