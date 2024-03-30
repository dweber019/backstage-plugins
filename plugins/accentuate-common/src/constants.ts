import { Entity } from '@backstage/catalog-model';
import { ConfigAllowedKind } from './types';

export const DEFAULT_ALLOWED_KINDS: ConfigAllowedKind[] = [
  { kind: 'User' },
  { kind: 'Group' },
  { kind: 'Component' },
  { kind: 'Resource' },
  { kind: 'API' },
  { kind: 'System' },
  { kind: 'Domain' },
];

export const isAllowedKind = (
  entity: Entity,
  allowedKinds: ConfigAllowedKind[],
) => {
  const entityWithSpecType = entity as Entity & { spec: { type?: string } };
  return allowedKinds.some(
    allowedKind =>
      (allowedKind.specType === undefined &&
        allowedKind.kind === entity.kind) ||
      (allowedKind.specType?.toLocaleLowerCase() ===
        entityWithSpecType.spec.type?.toLocaleLowerCase() &&
        allowedKind.kind === entity.kind),
  );
};

export const ANNOTATION_ACCENTUATE_DISABLE = 'accentuate/disable';

export const isAccentuateEnabled = (entity: Entity) =>
  entity.metadata.annotations?.[ANNOTATION_ACCENTUATE_DISABLE] === undefined ||
  !Boolean(entity.metadata.annotations?.[ANNOTATION_ACCENTUATE_DISABLE]);
