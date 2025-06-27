import { CatalogGraphPage } from '@backstage/plugin-catalog-graph';
import { useRelationsCatalogGraphDefaults } from '../../hooks';

export const RelationsCatalogGraphPage = (
  props: Parameters<typeof CatalogGraphPage>[0],
) => {
  const relationsProps = useRelationsCatalogGraphDefaults(props);
  return <CatalogGraphPage {...relationsProps} />;
};
