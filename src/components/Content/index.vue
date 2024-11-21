<template>
  <a-layout-content style="margin: 0 16px">
    <Breadcrumb style="margin: 16px 0" />
    <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
      <router-view></router-view>
    </div>
  </a-layout-content>
</template>
<script lang="ts" setup>
import Breadcrumb from "./Breadcrumb.vue";

defineOptions({
  name: "Content",
});
</script>
<style lang="less" scoped></style>
