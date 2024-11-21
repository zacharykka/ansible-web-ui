import { computed } from "vue";
import { useRouter, type RouteRecordRaw } from "vue-router";

export interface BreadcrumbRoute {
  path: string;
  breadcrumbName: string;
  children?: BreadcrumbRoute[];
}

export const useTransformRoute = () => {
  const router = useRouter();

  // Shared route transformation logic
  const transformRoute = (route: RouteRecordRaw) => {
    if (!route.meta?.title) {
      return null;
    }
    return route;
  };

  // Get menu routes
  const menuRoutes = computed(() => {
    return router.options.routes
      .map(transformRoute)
      .filter((route): route is RouteRecordRaw => route !== null);
  });

  // Transform route to breadcrumb format
  const transformToBreadcrumb = (route: RouteRecordRaw): BreadcrumbRoute | null => {
    if (!route.meta?.title) {
      return null;
    }

    return {
      path: route.path,
      breadcrumbName: route.meta.title as string,
      children: route.children
        ?.map(transformToBreadcrumb)
        .filter((child): child is BreadcrumbRoute => child !== null),
    };
  };

  // Get breadcrumb routes
  const breadcrumbRoutes = computed(() => {
    const matched = router.currentRoute.value.matched;
    const routes = matched
      .map(transformToBreadcrumb)
      .filter((route): route is BreadcrumbRoute => route !== null);

    return [
      {
        path: "/",
        breadcrumbName: "Ansible Web UI",
      },
      ...routes,
    ];
  });

  // Get selected menu keys
  const selectedMenuKeys = computed(() => {
    const currentPath = router.currentRoute.value.path;
    const menuKey = currentPath.startsWith("/") ? currentPath : `/${currentPath}`;

    // For regular menu items
    if (menuRoutes.value.some((route) => !route.children && route.path === menuKey)) {
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

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return {
    menuRoutes,
    breadcrumbRoutes,
    selectedMenuKeys,
    navigateTo,
  };
};