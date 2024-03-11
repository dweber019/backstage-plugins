import { configApiRef, useApi } from '@backstage/core-plugin-api';
import {
  ALL_RELATION_PAIRS,
  EntityRelationsGraphProps,
} from '@backstage/plugin-catalog-graph';

export function useRelationsCatalogGraphDefaults(
  props: Partial<EntityRelationsGraphProps>,
) {
  const configApi = useApi(configApiRef);

  let modifiedProps = props;
  if (modifiedProps.unidirectional === undefined) {
    modifiedProps = { ...modifiedProps, unidirectional: false };
  }

  if (modifiedProps.relationPairs === undefined) {
    const relations = configApi.getConfigArray('relationsProcessor.relations');
    let finalRelationPairs = ALL_RELATION_PAIRS;
    if (Array.isArray(relations)) {
      finalRelationPairs = [
        ...ALL_RELATION_PAIRS,
        ...relations
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
                      (standardPair[0] === pair[0] &&
                        standardPair[1] === pair[1]) ||
                      (standardPair[0] === pair[1] &&
                        standardPair[1] === pair[0]),
                  ),
              ),
          )
          .flat(),
      ];
    }
    modifiedProps = { ...modifiedProps, relationPairs: finalRelationPairs };
  }

  if (modifiedProps.showArrowHeads === undefined) {
    modifiedProps = { ...modifiedProps, showArrowHeads: true };
  }

  return modifiedProps;
}
