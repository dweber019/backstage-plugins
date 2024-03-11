import {
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { catalogGraphRouteRef } from '@backstage/plugin-catalog-graph';

/** @public */
export const relationsPlugin = createPlugin({
  id: 'relations',
  apis: [],
});

/**
 * @public
 */
export const EntityRelationsCard = relationsPlugin.provide(
  createComponentExtension({
    name: 'EntityRelationsCard',
    component: {
      lazy: () =>
        import('./components/EntityRelationsCard').then(
          m => m.EntityRelationsCard,
        ),
    },
  }),
);

/**
 * @public
 */
export const EntityRelationsCatalogGraphCard = relationsPlugin.provide(
  createComponentExtension({
    name: 'EntityRelationsCatalogGraphCard',
    component: {
      lazy: () =>
        import('./components/EntityRelationsCatalogGraphCard').then(
          m => m.EntityRelationsCatalogGraphCard,
        ),
    },
  }),
);

/**
 * @public
 */
export const RelationsCatalogGraphPage = relationsPlugin.provide(
  createRoutableExtension({
    name: 'RelationsCatalogGraphPage',
    component: () =>
      import('./components/RelationsCatalogGraphPage').then(
        m => m.RelationsCatalogGraphPage,
      ),
    mountPoint: catalogGraphRouteRef,
  }),
);
