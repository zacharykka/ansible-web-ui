<template>
  <a-layout-header
    class="site-layout-header"
    style="background: #fff; padding: 0"
  >
    <div class="header-right">
      <!-- Theme Switch -->
      <a-tooltip placement="bottom">
        <template #title>
          {{ isDark ? "Switch to Light Mode" : "Switch to Dark Mode" }}
        </template>
        <a-button type="link" class="header-action" @click="toggleTheme">
          <template #icon>
            <BulbOutlined v-if="!isDark" />
            <BulbFilled v-else />
          </template>
        </a-button>
      </a-tooltip>

      <!-- Language Switch -->
      <a-dropdown>
        <a-button type="link" class="header-action">
          <template #icon>
            <TranslationOutlined />
          </template>
          {{ currentLocale === "en" ? "English" : "中文" }}
        </a-button>
        <template #overlay>
          <a-menu @click="handleLocaleChange">
            <a-menu-item key="en">English</a-menu-item>
            <a-menu-item key="zh">中文</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>

      <!-- User Avatar -->
      <a-dropdown>
        <a-space class="header-action">
          <a-avatar>
            <template #icon><UserOutlined /></template>
          </a-avatar>
          <span>Admin</span>
        </a-space>
        <template #overlay>
          <a-menu>
            <!-- <a-menu-item key="profile">
              <UserOutlined />
              Profile
            </a-menu-item> -->
            <a-menu-item key="settings" @click="navigateTo('/settings')">
              <SettingOutlined />
              Settings
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item key="logout" @click="handleLogout">
              <LogoutOutlined />
              Logout
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
    <!-- <span>Ansible Web UI Header</span> -->
  </a-layout-header>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useTransformRoute } from "@/hooks/useTransformRoute";
import {
  BulbOutlined,
  BulbFilled,
  TranslationOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons-vue";

defineOptions({
  name: "Header",
});

const { navigateTo } = useTransformRoute();

// Theme
const isDark = ref(false);
const toggleTheme = () => {
  isDark.value = !isDark.value;
  // TODO: Implement theme switching logic
};

// Locale
const currentLocale = ref("en");
const handleLocaleChange = (menu: { key: string }) => {
  currentLocale.value = menu.key;
  // TODO: Implement language switching logic
};

// User actions
const handleLogout = () => {
  // TODO: Implement logout logic
};
</script>

<style scoped lang="scss">
.site-layout-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 24px !important;
  z-index: 1;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-action {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 8px;
  color: rgba(0, 0, 0, 0.85);
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.025);
  }
}
</style>
