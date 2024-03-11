import React from 'react';
import { EntityCatalogGraphCard } from '@backstage/plugin-catalog-graph';
import { useRelationsCatalogGraphDefaults } from '../../hooks';

export const EntityRelationsCatalogGraphCard = (
  props: Parameters<typeof EntityCatalogGraphCard>[0],
) => {
  const relationsProps = useRelationsCatalogGraphDefaults(props);
  return <EntityCatalogGraphCard {...relationsProps} />;
};
