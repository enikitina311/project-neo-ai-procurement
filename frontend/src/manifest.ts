import { lazy } from "react";
import type { ServiceManifest } from "@enikitina311/plugin-sdk-fe";
import { Package } from "lucide-react";

const ProcurementPage = lazy(() =>
  import("./pages").then((m) => ({ default: m.ProcurementPage })),
);
const ProcurementPackagePage = lazy(() =>
  import("./pages").then((m) => ({ default: m.ProcurementPackagePage })),
);

import { procurementRu as ru } from "./locales/ru";
import { procurementEn as en } from "./locales/en";

const manifest: ServiceManifest = {
  name: "procurement",
  displayName: "Закупки",
  version: "0.3.0",

  requires: [{ serviceName: "core", versionRange: ">=0.3.0" }],
  optional: [],

  applicableCategories: ["PROJECT"],

  displayMetadata: {
    serviceCode: "procurement",
    nameRu: "Ассистент закупок",
    nameEn: "Procurement Assistant",
    nameKey: "procurement:displayName",
    descriptionKey: "procurement:displayDescription",
    routePrefix: "procurement",
    backendComponentNames: ["korus_ai_procurement__component"],
    backendNames: ["korus_ai_procurement"],
  },

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
