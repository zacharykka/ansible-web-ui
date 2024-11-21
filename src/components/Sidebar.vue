<template>
  <a-layout-sider v-model:collapsed="collapsed" collapsible theme="light">
    <div class="logo">
      <img src="@/assets/logo.png" alt="logo" />
    </div>
    <a-menu
      :selectedKeys="selectedMenuKeys"
      @select="onSelect"
      theme="light"
      mode="inline"
    >
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
  DatabaseOutlined,
  ContainerOutlined,
  DesktopOutlined,
  AreaChartOutlined,
  SettingOutlined,
  HistoryOutlined,
  PieChartOutlined,
} from "@ant-design/icons-vue";
import { ref } from "vue";
import { useTransformRoute } from "@/hooks/useTransformRoute";

defineOptions({
  name: "Sidebar",
});

const { menuRoutes, selectedMenuKeys, navigateTo } = useTransformRoute();
const collapsed = ref<boolean>(false);
const currentSelectedKeys = ref<string[]>([]);

const onSelect = ({ selectedKeys: keys }: { selectedKeys: string[] }) => {
  currentSelectedKeys.value = keys;
};

// Icon mapping
const getIcon = (iconName?: string) => {
  const icons = {
    DatabaseOutlined,
    ContainerOutlined,
    DesktopOutlined,
    AreaChartOutlined,
    SettingOutlined,
    HistoryOutlined,
    PieChartOutlined,
  };
  return icons[iconName as keyof typeof icons] || AreaChartOutlined;
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
