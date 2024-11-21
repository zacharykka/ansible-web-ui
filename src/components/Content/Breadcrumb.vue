<template>
  <a-breadcrumb :routes="displayRoutes">
    <template #itemRender="{ route, routes, paths }">
      <span v-if="routes.indexOf(route) === routes.length - 1">{{
        route.breadcrumbName
      }}</span>
      <router-link v-else :to="`/${paths.join('/')}`">{{
        route.breadcrumbName
      }}</router-link>
    </template>
  </a-breadcrumb>
</template>

<script lang="ts" setup>
import { useTransformRoute } from "@/hooks/useTransformRoute";

const { breadcrumbRoutes } = useTransformRoute();

// Use breadcrumbRoutes directly in the template
const displayRoutes = breadcrumbRoutes;
</script>
