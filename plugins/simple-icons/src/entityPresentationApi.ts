import { CatalogApi, EntityPresentationApi, EntityRefPresentation } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { createIcon } from './simpleIcons';
import { type SimpleIcon } from 'simple-icons';
import { IconComponent } from '@backstage/core-plugin-api';
import * as icons from 'simple-icons';
import { DefaultEntityPresentationApi } from '@backstage/plugin-catalog';

export interface SimpleIconsEntityPresentationApiOptions {
  catalogApi: CatalogApi;
  entityPresentationApi?: EntityPresentationApi;
  color?: boolean;
}

export class SimpleIconsEntityPresentationApi implements EntityPresentationApi {

  private catalogApi: CatalogApi;
  private entityPresentationApi: EntityPresentationApi;
  private color: boolean;

  static create(
    options: SimpleIconsEntityPresentationApiOptions,
  ): EntityPresentationApi {
    return new SimpleIconsEntityPresentationApi(options);
  }

  private constructor(options: SimpleIconsEntityPresentationApiOptions) {
    this.catalogApi = options.catalogApi;
    this.entityPresentationApi = options.entityPresentationApi || DefaultEntityPresentationApi.create(options);
    this.color = options.color === undefined ? true : options.color;
  }

  forEntity(
    entityOrRef: Entity | string,
    context?: {
      defaultKind?: string;
      defaultNamespace?: string;
    },
  ): EntityRefPresentation {
    const entityRefPresentation = this.entityPresentationApi.forEntity(entityOrRef, context);
    if (typeof entityOrRef === 'string') {
      return {
        snapshot: entityRefPresentation.snapshot,
        update$: entityRefPresentation.update$,
        promise: this.catalogApi.getEntityByRef(entityOrRef).then(entity => {
          if (entity) {
            entityRefPresentation.snapshot.Icon = this.getIcon(entity, entityRefPresentation.snapshot.Icon);
          }
          return entityRefPresentation.snapshot
        }),
      };
    }
    entityRefPresentation.snapshot.Icon = this.getIcon(entityOrRef, entityRefPresentation.snapshot.Icon);
    return entityRefPresentation;
  }

  private getIcon(entity: Entity, defaultIcon: IconComponent | undefined | false) {
    if (defaultIcon === false) {
      return false;
    }
    const annotation = entity.metadata.annotations?.['simpleicons.org/icon-slug'];
    if (!!annotation) {
      const simpleIcons = Object.keys(icons).filter(key => {
        const icon = (icons as any)[key] as SimpleIcon;
        return icon.slug === annotation;
      }).map(key => {
        const icon = (icons as any)[key] as SimpleIcon;
        return createIcon(icon, this.color, { fontSize: 'inherit', width: 17, height: 17, y: 10, x: 10 });
      });
      if (simpleIcons.length > 0) {
        return simpleIcons[0];
      }
    }
    return defaultIcon;
  }

}
