import type { ServiceManifest } from "@enikitina311/plugin-sdk-fe";
import { Package } from "lucide-react";

import { ProcurementPage, ProcurementPackagePage } from "./pages";
import { procurementRu as ru } from "./locales/ru";
import { procurementEn as en } from "./locales/en";

const manifest: ServiceManifest = {
  name: "procurement",
  displayName: "Закупки",
  version: "0.3.0",

  requires: [{ serviceName: "core", versionRange: ">=0.3.0" }],
  optional: [],

  applicableCategories: ["PROJECT"],

  routes: [
    {
      path: ":projectId/procurement/:serviceId",
      component: ProcurementPage,
      permissions: ["workspace:member"],
    },
    {
      path: ":projectId/procurement/:serviceId/create",
      component: ProcurementPackagePage,
      permissions: ["workspace:member"],
    },
    {
      path: ":projectId/procurement/:serviceId/:packageId",
      component: ProcurementPackagePage,
      permissions: ["workspace:member"],
    },
  ],

  sidebarItems: [
    {
      label: "procurement:sidebar.label",
      icon: Package,
      path: "/projects/:wsId/procurement",
      order: 40,
      permissions: ["workspace:member"],
    },
  ],

  locales: [{ namespace: "procurement", ru, en }],
  slices: [],
  assistantTools: [],
};

export default manifest;
