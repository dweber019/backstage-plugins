import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { ALL_RELATION_PAIRS } from '@backstage/plugin-catalog-graph';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';

export interface RelationsWithLabel {
  name: string;
  label?: string;
}

export function useRelations(relations?: RelationsWithLabel[]) {
  const configApi = useApi(configApiRef);
  const { entity } = useEntity<Entity>();

  const relationsConfig = configApi.getConfigArray(
    'relationsProcessor.relations',
  );
  const relationsWithoutDefaults = relationsConfig
    .map(relationConfig =>
      relationConfig
        .getConfigArray('pairs')
        .map(
          pair =>
            [pair.getString('incoming'), pair.getString('outgoing')] as [
              string,
              string,
            ],
        )
        .filter(
          pair =>
            !ALL_RELATION_PAIRS.some(
              standardPair =>
                (standardPair[0] === pair[0] && standardPair[1] === pair[1]) ||
                (standardPair[0] === pair[1] && standardPair[1] === pair[0]),
            ),
        )
        .flat(),
    )
    .flat();

  const map = new Map<string, string[]>();
  entity.relations
    ?.filter(relation => {
      if (relations) {
        return relations.some(s => s.name === relation.type);
      }
      return relationsWithoutDefaults.includes(relation.type);
    })
    .forEach(relation => {
      if (map.has(relation.type)) {
        map.set(relation.type, [
          ...map.get(relation.type)!,
          relation.targetRef,
        ]);
      } else {
        map.set(relation.type, [relation.targetRef]);
      }
    });

  return Array.from(map.keys()).map(relationName => {
    const relationWithLabel = relations?.find(
      relation => relation.name === relationName,
    );
    return {
      label: (relationWithLabel && relationWithLabel.label) || relationName,
      entityRefs: map.get(relationName) || [],
    };
  });
}
