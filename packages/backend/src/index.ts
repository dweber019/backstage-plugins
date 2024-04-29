import { createBackend } from '@backstage/backend-defaults';
import {
  accentuatePlugin,
  catalogModuleAccentuateProcessor,
} from '@dweber019/backstage-plugin-accentuate-backend';

const backend = createBackend();
backend.add(import('@backstage/plugin-app-backend/alpha'));
backend.add(import('@backstage/plugin-proxy-backend/alpha'));
backend.add(import('@backstage/plugin-scaffolder-backend/alpha'));
backend.add(import('@backstage/plugin-techdocs-backend/alpha'));
// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
// See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
// See https://backstage.io/docs/auth/guest/provider
// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend/alpha'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);
// permission plugin
backend.add(import('@backstage/plugin-permission-backend/alpha'));
backend.add(
  import('@backstage/plugin-permission-backend-module-allow-all-policy'),
);
// search plugin
backend.add(import('@backstage/plugin-search-backend/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-catalog/alpha'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs/alpha'));

// api-docs-module-wsdl-backend plugin
backend.add(import('@dweber019/backstage-plugin-api-docs-module-wsdl-backend'));

// endoflife-backend plugin
backend.add(import('@dweber019/backstage-plugin-endoflife-backend'));

// relations-backend plugin
backend.add(import('@dweber019/backstage-plugin-relations-backend'));

// accentuate-backend plugin
backend.add(accentuatePlugin);
backend.add(catalogModuleAccentuateProcessor);

backend.start();
