import {
  CatalogProcessor,
  CatalogProcessorEmit,
  processingResult,
} from '@backstage/plugin-catalog-node';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import {
  CompoundEntityRef,
  Entity,
  entityKindSchemaValidator,
  getCompoundEntityRef,
  parseEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { get } from 'lodash';
import { ProcessorConfig } from './processorConfig';
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';

export class RelationEntitiesProcessor implements CatalogProcessor {
  private readonly logger: LoggerService;
  private readonly processorConfig: ProcessorConfig;
  private readonly schema;

  constructor(options: { logger: LoggerService; processorConfig: ProcessorConfig }) {
    this.logger = options.logger.child({
      type: 'processor',
      processor: this.getProcessorName(),
    });
    this.processorConfig = options.processorConfig;
    this.schema = this.processorConfig.getSchema();
  }

  getProcessorName(): string {
    return 'RelationEntitiesProcessor';
  }
  async validateEntityKind(entity: Entity): Promise<boolean> {
    const validator = entityKindSchemaValidator(this.schema);
    return !!validator(entity);
  }

  async postProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    emit: CatalogProcessorEmit,
  ): Promise<Entity> {
    const selfRef = getCompoundEntityRef(entity);
    const doEmit = (
      targets: CompoundEntityRef[],
      outgoingRelation: string,
      incomingRelation: string,
    ) => {
      if (!Array.isArray(targets)) {
        return;
      }
      for (const targetRef of targets) {
        emit(
          processingResult.relation({
            source: selfRef,
            type: outgoingRelation,
            target: {
              kind: targetRef.kind,
              namespace: targetRef.namespace,
              name: targetRef.name,
            },
          }),
        );
        emit(
          processingResult.relation({
            source: {
              kind: targetRef.kind,
              namespace: targetRef.namespace,
              name: targetRef.name,
            },
            type: incomingRelation,
            target: selfRef,
          }),
        );
      }
    };

    this.processorConfig.getRelations(entity).forEach(relation => {
      const defaultKind =
        (Array.isArray(relation.targetKinds) && relation.targetKinds[0]) ||
        undefined;
      const defaultContext = {
        defaultKind,
        defaultNamespace: selfRef.namespace,
      };
      const relationValue = this.getEntityAttribute(entity, relation.attribute);
      const targetEntityRefs =
        // Or should we use relation.multi, this approach is more forgiving
        (Array.isArray(relationValue) ? relationValue : [relationValue])
          .map(stringRef => parseEntityRef(stringRef, defaultContext))
          .filter(entityRef => {
            if (
              relation.targetKinds === undefined ||
              relation.targetKinds.length === 0 ||
              relation.targetKinds.includes(entityRef.kind)
            ) {
              this.logger.debug('Add relation to entity', {
                entity: stringifyEntityRef(entity),
                targetEntity: stringifyEntityRef(entityRef),
                attribute: relation.attribute,
              });
              return true;
            }
            this.logger.warn(
              'Relation for target entity is not allowed. Correct target entity or check your targetKinds configuration.',
              {
                entity: stringifyEntityRef(entity),
                targetEntity: stringifyEntityRef(entityRef),
                attribute: relation.attribute,
              },
            );
            return false;
          });

      relation.pairs.forEach(pair => {
        doEmit(targetEntityRefs, pair.outgoing, pair.incoming);
      });
    });

    return entity;
  }

  private getEntityAttribute(entity: Entity, attribute: string) {
    return get(entity.spec, attribute) as string[] | string;
  }

  public static fromConfig(options: { logger: LoggerService; config: Config }) {
    return new RelationEntitiesProcessor({
      logger: options.logger,
      processorConfig: new ProcessorConfig(options.config),
    });
  }
}
