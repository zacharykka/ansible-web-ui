<template>
  <a-layout style="min-height: 100vh">
    <!-- sidebar -->
    <Sidebar />

    <a-layout>
      <!-- header -->
      <Header />

      <!-- content -->
      <Content />

      <!-- footer -->
      <Footer />
    </a-layout>
  </a-layout>
</template>
<script lang="ts" setup></script>
<style scoped>
.site-layout-header {
  /* 设置文字居中 */
  text-align: center;
  /* 设置字体大小 */
  font-size: 28px;
}

.site-layout .site-layout-background {
  background: #fff;
}
[data-theme="dark"] .site-layout .site-layout-background {
  background: #141414;
}
</style>
