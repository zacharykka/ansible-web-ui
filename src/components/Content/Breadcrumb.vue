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
import { computed } from "vue";
import { useRouter, RouteRecordRaw } from "vue-router";

interface BreadcrumbRoute {
  path: string;
  breadcrumbName: string;
  children?: BreadcrumbRoute[];
}

const router = useRouter();

// Recursive function to transform routes to breadcrumb format
const transformRouteToBreadcrumb = (
  route: RouteRecordRaw
): BreadcrumbRoute | null => {
  // Skip routes without title
  if (!route.meta?.title) {
    return null;
  }

  const breadcrumb: BreadcrumbRoute = {
    path: route.path,
    breadcrumbName: route.meta.title as string,
  };

  // Process children recursively
  if (route.children?.length) {
    const children = route.children
      .map(transformRouteToBreadcrumb)
      .filter((child): child is BreadcrumbRoute => child !== null);

    if (children.length) {
      breadcrumb.children = children;
    }
  }

  return breadcrumb;
};

// Get current matched routes and transform them to breadcrumb format
const displayRoutes = computed(() => {
  const matched = router.currentRoute.value.matched;
  const routes = matched
    .map(transformRouteToBreadcrumb)
    .filter((route): route is BreadcrumbRoute => route !== null);

  // Add root path at the beginning
  return [
    {
      path: "/",
      breadcrumbName: "Ansible Web UI",
    },
    ...routes,
  ];
});
console.log(displayRoutes.value);
</script>
