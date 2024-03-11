import { Config } from '@backstage/config';
import relationV1alpha1Schema from './Relation.v1alpha1.schema.json';
import { Entity } from '@backstage/catalog-model';

interface RelationConfig {
  sourceKind: string;
  sourceType?: string;
  targetKinds?: string[];
  attribute: string;
  multi?: boolean;
  pairs: {
    incoming: string;
    outgoing: string;
  }[];
}

export class ProcessorConfig {
  private relations: RelationConfig[] = [];

  constructor(config: Config) {
    this.extractConfig(config);
  }

  getRelations(entity: Entity) {
    return this.relations.filter(relation => {
      return (
        entity.kind.toLocaleLowerCase() === relation.sourceKind &&
        entity.spec?.hasOwnProperty(relation.attribute) &&
        (relation.sourceType === undefined ||
          (entity.spec?.type &&
            (entity.spec?.type as string).toLocaleLowerCase() ===
              relation.sourceType))
      );
    });
  }

  getSchema() {
    const finalSchema = relationV1alpha1Schema;
    this.relations.forEach(relation => {
      if (relation.multi) {
        // @ts-ignore
        finalSchema.allOf[1].properties.spec.properties[relation.attribute] = {
          type: 'array',
          items: {
            type: 'string',
          },
        };
      } else {
        // @ts-ignore
        finalSchema.allOf[1].properties.spec.properties[relation.attribute] = {
          type: 'string',
        };
      }
    });
    // @ts-ignore
    finalSchema.allOf[1].properties.kind.enum = this.relations.map(relation =>
      relation.sourceKind.toLocaleLowerCase(),
    );
    return finalSchema;
  }

  private extractConfig(config: Config) {
    const configArray = config.getConfigArray('relationsProcessor.relations');
    this.relations = configArray.map(relationConfig => ({
      sourceKind: relationConfig.getString('sourceKind').toLocaleLowerCase(),
      sourceType: relationConfig
        .getOptionalString('sourceType')
        ?.toLocaleLowerCase(),
      targetKinds: relationConfig
        .getOptionalStringArray('targetKinds')
        ?.map(target => target.toLocaleLowerCase()),
      attribute: relationConfig.getString('attribute'),
      multi: relationConfig.getOptionalBoolean('multi') || false,
      pairs: relationConfig.getConfigArray('pairs').map(pairConfig => ({
        incoming: pairConfig.getString('incoming'),
        outgoing: pairConfig.getString('outgoing'),
      })),
    }));
  }
}
